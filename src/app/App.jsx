import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pickIconForNavNode } from '@/config/nav-icon-policy.js';
import { NAV, idToPath, pathToId } from '@/config/nav.js';
import { SEARCH_DOCS_INDEX } from '@/config/search-index-runtime.js';
import { DocsShell } from '@/layouts/docs-shell/DocsShell.jsx';
import { DocsHeader } from '@/layouts/docs-header/DocsHeader.jsx';
import { PageChromeProvider } from '@/context/PageChromeContext.jsx';
import { getAncestorIds, getBreadcrumbCrumbs, getNavNodeById, getPageNeighbors } from '@/utils/navigation.js';
import { PageNav } from '@/components/ui.jsx';
import { pages } from './pagesRegistry.js';
import { ThemeColorRoot } from './ThemeColorRoot.jsx';
import homeStyles from '@/pages/home.module.css';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawPath = location.pathname;
  const normalizedPath = rawPath !== '/' && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const currentId = pathToId[normalizedPath] || 'home';
  const editHref = import.meta.env.DEV ? '/editor/page/' + currentId : null;
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set(getAncestorIds(NAV, pathToId[location.pathname] || 'home')));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const searchRef = useRef(null);

  const query = search.trim().toLowerCase();

  function getMatchBlock(blocks, q) {
    if (!q) return null;
    return blocks?.find((block) => block.text.toLowerCase().includes(q)) ?? null;
  }

  // Build a compact preview from the matched block only.
  const makeSnippet = useCallback((text, q) => {
    if (!text || !q) return '';
    const lower = text.toLowerCase();
    const i = lower.indexOf(q);
    if (i === -1) return '';
    const before = Math.max(0, i - 45);
    const after = Math.min(text.length, i + q.length + 70);
    const head = before > 0 ? '…' : '';
    const tail = after < text.length ? '…' : '';
    return `${head}${text.slice(before, after).replace(/\s+/g, ' ').trim()}${tail}`;
  }, []);

  const formatBreadcrumb = useCallback((crumbs) => {
    if (crumbs.length === 0) return '';
    if (crumbs.length <= 2) return crumbs.map((c) => c.label).join(' > ');
    return `${crumbs[0].label} > ... > ${crumbs.at(-1).label}`;
  }, []);

  const go = useCallback(
    (id, hash) => {
      if (!pages[id]) return;
      navigate(idToPath[id] || '/');
      setSidebarOpen(false);
      if (mainRef.current) mainRef.current.scrollTop = 0;
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
    [navigate],
  );

  const onNavRowClick = useCallback(
    (id, hasChildren) => {
      if (!pages[id]) return;
      navigate(idToPath[id] || '/');
      setSidebarOpen(false);
      if (mainRef.current) mainRef.current.scrollTop = 0;
      if (hasChildren) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    },
    [navigate],
  );

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const ancestors = getAncestorIds(NAV, currentId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- merge ancestor ids when route changes
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestors.forEach((id) => next.add(id));
      return next;
    });
  }, [currentId]);

  const results = query
    ? SEARCH_DOCS_INDEX.filter((p) => {
        const titleHit = p.title?.toLowerCase().includes(query);
        const textHit = !!getMatchBlock(p.blocks, query);
        return titleHit || textHit;
      })
        .slice(0, 8)
        .map((p) => {
          const crumbs = getBreadcrumbCrumbs(NAV, p.id);
          const breadcrumb = formatBreadcrumb(crumbs);
          const matchBlock = getMatchBlock(p.blocks, query);
          const snippet = matchBlock ? makeSnippet(matchBlock.text, query) : '';
          return { ...p, breadcrumb, snippet };
        })
    : [];

  const PageComponent = pages[currentId] || pages.home;
  const { prevId, prevLabel, nextId, nextLabel } = getPageNeighbors(currentId, NAV);
  const navMeta = getNavNodeById(NAV, currentId);
  const showTitleIcon = !!(navMeta && navMeta.depth <= 2 && currentId !== 'home');
  const titleIconName = showTitleIcon
    ? (navMeta.node.icon || pickIconForNavNode(navMeta.node, navMeta.depth))
    : null;
  const breadcrumbCrumbs = getBreadcrumbCrumbs(NAV, currentId);

  // Home page: header (no hamburger) + full-width content, no sidebar
  if (currentId === 'home') {
    const HomeComponent = pages.home;
    return (
      <>
        <ThemeColorRoot theme={theme} />
        <DocsHeader
          hideMenu
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
        <div className={homeStyles.homeRoot}>
          <div className={homeStyles.homeContent}>
            <Suspense><HomeComponent go={go} /></Suspense>
            <PageNav next={nextId} nextLabel={nextLabel} go={go} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThemeColorRoot theme={theme} />
      <DocsShell
        NAV={NAV}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mainRef={mainRef}
        onMainClick={() => setSearchOpen(false)}
        currentId={currentId}
        expandedIds={expandedIds}
        toggleExpand={toggleExpand}
        onNavRowClick={onNavRowClick}
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
      >
        <PageChromeProvider value={{ titleIconName, breadcrumbCrumbs }}>
          <Suspense><PageComponent go={go} /></Suspense>
          <PageNav prev={prevId} prevLabel={prevLabel} next={nextId} nextLabel={nextLabel} go={go} />
        </PageChromeProvider>
      </DocsShell>
    </>
  );
}
