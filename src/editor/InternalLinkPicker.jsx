import { useEffect, useMemo, useState } from 'react';
import { NAV } from '@/config/nav.js';
import styles from './EditorToolbar.module.css';

function flattenNodes(nodes, parents = [], result = []) {
  for (const node of nodes) {
    result.push({ node, parents });
    if (node.children) flattenNodes(node.children, [...parents, node], result);
  }
  return result;
}

function nodeText(node) {
  return (node.content ?? []).map((child) => {
    if (child.type === 'text') return child.text ?? '';
    return nodeText(child);
  }).join('');
}

function collectHeadings(content, result = []) {
  for (const node of content ?? []) {
    if (node.type === 'heading' && node.attrs?.id) {
      result.push({ id: node.attrs.id, label: nodeText(node) || node.attrs.id, level: node.attrs.level ?? 2 });
    }
    if (node.content) collectHeadings(node.content, result);
  }
  return result;
}

export function InternalLinkPicker({ anchor, initialValue, onSelect, onClose }) {
  const [path, setPath] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);
  const [headings, setHeadings] = useState([]);
  const [loadingHeadings, setLoadingHeadings] = useState(false);
  const [error, setError] = useState('');

  const allPages = useMemo(() => flattenNodes(NAV).filter(({ node }) => node.id !== 'home'), []);
  const currentNodes = path.length ? path[path.length - 1].children ?? [] : NAV.filter((node) => node.id !== 'home');
  const query = search.trim().toLowerCase();

  const visibleNodes = query
    ? allPages
      .filter(({ node, parents }) => [node.label, node.id, node.path, ...parents.map((parent) => parent.label)]
        .filter(Boolean).some((value) => value.toLowerCase().includes(query)))
      .map(({ node, parents }) => ({ node, parents }))
    : currentNodes.map((node) => ({ node, parents: path }));

  const visibleHeadings = query
    ? headings.filter((heading) => (heading.label + ' ' + heading.id).toLowerCase().includes(query))
    : headings;

  useEffect(() => {
    if (!initialValue) return;
    const pageId = initialValue.split('#')[0];
    const match = allPages.find(({ node }) => node.id === pageId);
    if (match) setSelectedPage(match.node);
  }, [allPages, initialValue]);

  const choosePage = async (node) => {
    setSelectedPage(node);
    setHeadings([]);
    setError('');
    setLoadingHeadings(true);
    try {
      const response = await fetch('/api/editor/page/' + node.id);
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Unable to load page parts');
      setHeadings(collectHeadings(data.doc?.content));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingHeadings(false);
    }
  };

  const chooseNode = (node, parents) => {
    if (node.children?.length) {
      setPath([...parents, node]);
      setSearch('');
      return;
    }
    choosePage(node);
  };

  const breadcrumb = selectedPage ? [...path, selectedPage] : path;

  return (
    <>
      <div className={styles.popupOverlay} onClick={onClose} />
      <div className={styles.internalPicker} style={{ left: anchor.x, top: anchor.y }}>
        <div className={styles.pickerHeader}>
          <strong>Choose internal link</strong>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <input
          className={styles.pickerSearch}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search pages or parts..."
          autoFocus
        />
        <div className={styles.pickerBreadcrumb}>
          <button type="button" onClick={() => { setPath([]); setSelectedPage(null); setHeadings([]); setSearch(''); }}>All modules</button>
          {breadcrumb.map((item, index) => (
            <span key={item.id}>
              <span className={styles.pickerSeparator}>›</span>
              <button type="button" onClick={() => {
                if (selectedPage && index === breadcrumb.length - 1) return;
                setPath(path.slice(0, index + 1));
                setSelectedPage(null);
                setHeadings([]);
                setSearch('');
              }}>{item.label}</button>
            </span>
          ))}
        </div>
        <div className={styles.pickerList}>
          {selectedPage ? (
            <>
              <button type="button" className={styles.pageTarget} onClick={() => onSelect(selectedPage.id)}>
                Link to {selectedPage.label}
              </button>
              {loadingHeadings && <div className={styles.pickerStatus}>Loading page parts...</div>}
              {!loadingHeadings && visibleHeadings.map((heading) => (
                <button type="button" key={heading.id} className={styles.pickerItem} onClick={() => onSelect(selectedPage.id + '#' + heading.id)}>
                  <span className={styles.headingLevel}>H{heading.level}</span>
                  {heading.label}
                </button>
              ))}
              {!loadingHeadings && !visibleHeadings.length && <div className={styles.pickerStatus}>No matching parts</div>}
            </>
          ) : (
            visibleNodes.map(({ node, parents }) => (
              <div key={node.id} className={styles.pickerItem}>
                <button type="button" className={styles.pickerName} onClick={() => chooseNode(node, parents)}>
                  <span>{node.label}</span>
                  {node.children?.length ? <span className={styles.pickerArrow}>›</span> : null}
                </button>
                {node.children?.length ? (
                  <button type="button" className={styles.pickerLink} onClick={() => choosePage(node)}>Link</button>
                ) : null}
              </div>
            ))
          )}
          {!selectedPage && !visibleNodes.length && <div className={styles.pickerStatus}>No matching pages</div>}
          {error && <div className={styles.pickerError}>{error}</div>}
        </div>
      </div>
    </>
  );
}
