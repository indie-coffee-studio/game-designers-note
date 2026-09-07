import { Icon } from '@/components/Icon.jsx';
import styles from './DocsHeader.module.css';

export function DocsHeader({
  onMenuClick,
  onBrandClick,
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
  hideMenu,
}) {
  return (
    <header className={styles.headerBar}>
      <div className={styles.headerInner}>
        {!hideMenu && <button type="button" className={styles.menuToggle} onClick={onMenuClick} aria-label="Toggle sidebar">
          <Icon name="bars" />
        </button>}
        <span className={styles.brandTitle} onClick={onBrandClick}>
          <span className={styles.brandInner}>
            <Icon name="clone" className={styles.brandIcon} />
            <span>Game Design Brew Log</span>
          </span>
        </span>
        <div className={styles.searchRegion} ref={searchRef}>
          <span className={styles.searchGlyph}>
            <Icon name="magnifying-glass" className={styles.searchGlyphIcon} />
          </span>
          <input
            className={styles.searchField}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search…"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearch('');
                setSearchOpen(false);
              }
            }}
          />
          {searchOpen && results.length > 0 && (
            <div className={styles.resultsPanel}>
              {results.map((r) => (
                <div
                  key={r.id}
                  className={styles.resultRow}
                  onClick={() => {
                    go(r.id);
                    setSearch('');
                    setSearchOpen(false);
                  }}
                >
                  {r.breadcrumb && <div className={styles.resultBreadcrumb}>{r.breadcrumb}</div>}
                  <div className={styles.resultTitle}>{r.title}</div>
                  {r.snippet ? <div className={styles.resultSnippet}>{r.snippet}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
        {editHref && (
          <a href={editHref} className={styles.editLink} target="_blank" rel="noreferrer">
            Edit Page
          </a>
        )}
        <button type="button" className={styles.themeToggle} onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} aria-label="Toggle theme">
          <Icon name={theme === 'dark' ? 'fas:sun' : 'far:moon'} />
        </button>
      </div>
    </header>
  );
}
