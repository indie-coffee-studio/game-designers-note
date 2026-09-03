import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { EditorHeader } from './EditorHeader.jsx';
import { NavTreeEditor } from './NavTreeEditor.jsx';
import { PageEditor } from './PageEditor.jsx';
import { NewPageModal } from './NewPageModal.jsx';
import styles from './EditorApp.module.css';

function EditorMain() {
  const navigate = useNavigate();
  const { pageId } = useParams();

  const [navData, setNavData] = useState(null);
  const [navDirty, setNavDirty] = useState(false);
  const [pageDirty, setPageDirty] = useState(false);
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageParent, setNewPageParent] = useState(null);

  // Load nav on mount
  useEffect(() => {
    fetch('/api/editor/nav')
      .then((r) => r.json())
      .then((data) => setNavData(data))
      .catch(console.error);
  }, []);

  const handleNavChange = useCallback((newNav) => {
    setNavData(newNav);
    setNavDirty(true);
  }, []);

  const handleSaveNav = useCallback(async () => {
    if (!navData) return;
    await fetch('/api/editor/nav', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(navData),
    });
    setNavDirty(false);
    // Reload page to pick up nav changes
    window.location.reload();
  }, [navData]);

  const handleNewPage = useCallback((parentId) => {
    setNewPageParent(parentId);
    setShowNewPage(true);
  }, []);

  const handlePageCreated = useCallback((newId) => {
    setShowNewPage(false);
    // Refresh nav data from server (API already updated it)
    fetch('/api/editor/nav')
      .then((r) => r.json())
      .then((data) => { setNavData(data); navigate(`/editor/page/${newId}`); })
      .catch(console.error);
  }, [navigate]);

  const isDirty = navDirty || pageDirty;

  return (
    <div className={styles.editorRoot}>
      <EditorHeader isDirty={isDirty} onSaveNav={handleSaveNav} pageId={pageId} />

      <div className={styles.body}>
        <NavTreeEditor
          navData={navData}
          selectedId={pageId}
          onSelect={(id) => navigate(`/editor/page/${id}`)}
          onNavChange={handleNavChange}
          onNewPage={handleNewPage}
        />
        <main className={styles.main}>
          <PageEditor
            key={pageId}
            pageId={pageId}
            onDirty={() => setPageDirty(true)}
          />
        </main>
      </div>

      {showNewPage && navData && (
        <NewPageModal
          navData={navData}
          defaultParentId={newPageParent}
          onClose={() => setShowNewPage(false)}
          onCreated={handlePageCreated}
        />
      )}
    </div>
  );
}

export default function EditorApp() {
  return (
    <Routes>
      <Route path="/editor/page/:pageId" element={<EditorMain />} />
      <Route path="/editor" element={<Navigate to="/editor/page/home" replace />} />
      <Route path="/editor/*" element={<Navigate to="/editor/page/home" replace />} />
    </Routes>
  );
}
