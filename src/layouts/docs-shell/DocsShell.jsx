import { useEffect, useRef, useState } from 'react';
import { NavItem } from '@/features/navigation/NavItem.jsx';
import { DocsHeader } from '@/layouts/docs-header/DocsHeader.jsx';
import styles from './DocsShell.module.css';

// Build the right-side table of contents from rendered headings.
function getTocItems(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]'))
    .map((heading) => ({ id: heading.id, label: heading.textContent?.replace(/\s+/g, ' ').trim() ?? '', level: Number(heading.tagName.slice(1)) }))
    .filter((item) => item.label);
}

function pickActiveTocId(headings, rootTop) {
  let activeId = headings[0]?.id ?? '';
  headings.forEach((heading) => {
    if (heading.getBoundingClientRect().top - rootTop <= 96) activeId = heading.id;
  });
  return activeId;
}

export function DocsShell({
  NAV,
  sidebarOpen,
  setSidebarOpen,
  mainRef,
  onMainClick,
  currentId,
  expandedIds,
  toggleExpand,
  onNavRowClick,
  search,
  setSearch,
  searchOpen,
  setSearchOpen,
  results,
  go,
  theme,
  setTheme,
  searchRef,
  editHref,
  children,
}) {
  const readingRef = useRef(null);
  const [tocItems, setTocItems] = useState([]);
  const [activeTocId, setActiveTocId] = useState('');

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const nextItems = getTocItems(readingRef.current);
      setTocItems(nextItems);
      setActiveTocId(nextItems[0]?.id ?? '');
    });
    return () => cancelAnimationFrame(frameId);
  }, [currentId]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || tocItems.length === 0) return;
    const updateActiveTocId = () => {
      const headings = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean);
      if (headings.length === 0) return;
      setActiveTocId(pickActiveTocId(headings, main.getBoundingClientRect().top));
    };
    updateActiveTocId();
    main.addEventListener('scroll', updateActiveTocId, { passive: true });
    window.addEventListener('resize', updateActiveTocId);
    return () => {
      main.removeEventListener('scroll', updateActiveTocId);
      window.removeEventListener('resize', updateActiveTocId);
    };
  }, [mainRef, tocItems]);

  return (
    <div className={styles.appRoot}>
      <DocsHeader
        onMenuClick={() => setSidebarOpen((v) => !v)}
        onBrandClick={() => go('home')}
        search={search}
        setSearch={setSearch}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        results={results}
        go={go}
        theme={theme}
        setTheme={setTheme}
        searchRef={searchRef}
        editHref={editHref}
      />
      <div className={styles.bodyRow}>
        {sidebarOpen && <div className={styles.overlayScrim} onClick={() => setSidebarOpen(false)} />}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.drawerOpen : ''}`}>
          {NAV.map((node) => (
            <NavItem
              key={node.path ?? node.id}
              node={node}
              currentId={currentId}
              onNavRowClick={onNavRowClick}
              depth={0}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </aside>
        <main ref={mainRef} className={styles.mainPane} onClick={onMainClick}>
          <div className={styles.contentGrid}>
            <div ref={readingRef} className={styles.readingColumn}>{children}</div>
            {tocItems.length > 0 && (
              <aside className={styles.tocPane} aria-label="On this page">
                <div className={styles.tocCard}>
                  <div className={styles.tocTitle}>On this page</div>
                  <div className={styles.tocList}>
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.tocLink} ${activeTocId === item.id ? styles.tocLinkActive : ''}`}
                        style={{ paddingLeft: `${(item.level - 2) * 14}px` }}
                        onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
