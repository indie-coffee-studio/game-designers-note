import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Node, Mark, mergeAttributes } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CalloutExtension } from './extensions/CalloutExtension.js';
import { FigureExtension } from './extensions/FigureExtension.js';
import { InternalLinkExtension } from './extensions/InternalLinkExtension.js';
import { LIColorExtension } from './extensions/LIColorExtension.js';
import { CardsGridExtension } from './extensions/CardsGridExtension.js';
import { EditorToolbar } from './EditorToolbar.jsx';
import styles from './PageEditor.module.css';

// Heading extension that preserves and renders the `id` attr for anchor links
const HeadingWithId = Heading.extend({
  addAttributes() {
    return { ...this.parent?.(), id: { default: null } };
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level;
    return [`h${level}`, mergeAttributes(HTMLAttributes, { id: node.attrs.id ?? undefined }), 0];
  },
});

// Allow block-level children inside blockquote (heading, list, nested blockquote)
const BlockquoteExtended = Blockquote.extend({ content: 'block+' });

// Display-only mark for Annotation nodes (prevents setContent from throwing on unknown mark)
const AnnotationExtension = Mark.create({
  name: 'annotation',
  addAttributes() {
    return { note: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'span[data-annotation]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-annotation': HTMLAttributes.note,
      style: 'border-bottom: 1px dashed #c07840; cursor: help;',
      title: HTMLAttributes.note,
    }), 0];
  },
});

// Non-editable placeholder for native HTML elements (table, etc.) — round-trips without data loss
const NativeHtmlExtension = Node.create({
  name: 'nativeHtml',
  group: 'block',
  atom: true,

  addAttributes() {
    return { jsx: { default: '' } };
  },

  parseHTML() {
    return [{ tag: 'div[data-native-html]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const tag = node.attrs.jsx.match(/^<(\w+)/)?.[1] ?? 'html';
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-native-html': 'true',
      style: 'background:#f5f0eb;border-left:3px solid #c8b090;padding:6px 12px;color:#999;font-size:12px;font-family:monospace;cursor:default',
      contenteditable: 'false',
    }), `[Native <${tag}> — read-only, preserved on save]`];
  },
});

const EXTENSIONS = [
  StarterKit.configure({
    heading: false,    // replaced by HeadingWithId
    listItem: false,   // replaced by LIColorExtension
    blockquote: false, // replaced by BlockquoteExtended
  }),
  HeadingWithId.configure({ levels: [1, 2, 3, 4] }),
  BlockquoteExtended,
  NativeHtmlExtension,
  LIColorExtension,
  Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank' } }),
  TaskList,
  TaskItem.configure({ nested: false }),
  CalloutExtension,
  FigureExtension,
  CardsGridExtension,
  InternalLinkExtension,
  AnnotationExtension,
];

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const response = await fetch('/api/editor/images', { method: 'POST', body: formData });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Image upload failed');
  return result;
}

function imageFileFromTransfer(dataTransfer) {
  return Array.from(dataTransfer?.files || []).find((file) => file.type.startsWith('image/'));
}

// ─── Link popup ──────────────────────────────────────────────────────────────

function LinkPopup({ popup, editor, navigate, onClose }) {
  const handleVisit = () => {
    if (popup.id) {
      const [pageId] = popup.id.split('#');
      if (pageId) navigate(`/editor/page/${pageId}`);
    } else {
      window.open(popup.href, '_blank');
    }
    onClose();
  };

  const handleEdit = () => {
    if (popup.id) {
      const newId = window.prompt('Page ID (optionally with #anchor)', popup.id);
      if (newId === null) { onClose(); return; }
      editor.chain().focus().setMark('internalLink', { id: newId }).run();
    } else {
      const newUrl = window.prompt('URL', popup.href);
      if (newUrl === null) { onClose(); return; }
      if (newUrl === '') editor.chain().focus().unsetLink().run();
      else editor.chain().focus().setLink({ href: newUrl, target: '_blank' }).run();
    }
    onClose();
  };

  return (
    <>
      <div className={styles.popupOverlay} onClick={onClose} />
      <div className={styles.linkPopup} style={{ left: popup.x, top: popup.y }}>
        <span className={styles.popupLabel}>{popup.id ?? popup.href}</span>
        <button onClick={handleVisit}>Visit ↗</button>
        <button onClick={handleEdit}>Edit ✎</button>
      </div>
    </>
  );
}

// ─── PageEditor ──────────────────────────────────────────────────────────────

export function PageEditor({ pageId, onDirty }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [linkPopup, setLinkPopup] = useState(null);

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: null,
    editorProps: {
      handlePaste: (view, event) => {
        const file = imageFileFromTransfer(event.clipboardData);
        if (!file) return false;
        uploadImage(file)
          .then(({ src }) => {
            const node = view.state.schema.nodes.figure.create({ src, caption: '' });
            view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
          })
          .catch((uploadError) => setError(uploadError.message));
        return true;
      },
      handleDrop: (view, event) => {
        const file = imageFileFromTransfer(event.dataTransfer);
        if (!file) return false;
        event.preventDefault();
        uploadImage(file)
          .then(({ src }) => {
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const position = coordinates?.pos ?? view.state.selection.from;
            const node = view.state.schema.nodes.figure.create({ src, caption: '' });
            view.dispatch(view.state.tr.insert(position, node).scrollIntoView());
          })
          .catch((uploadError) => setError(uploadError.message));
        return true;
      },
    },
    onUpdate: () => {
      setSaveStatus('');
      if (onDirty) onDirty();
    },
  });

  useEffect(() => {
    if (!pageId || !editor) return;
    setLoading(true);
    setError(null);
    setSaveStatus('');

    fetch(`/api/editor/page/${pageId}`)
      .then((r) => r.json())
      .then(({ doc, error: err }) => {
        if (err) { setError(err); return; }
        editor.commands.setContent(doc, false);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [pageId, editor]);

  const handleSave = useCallback(async () => {
    if (!editor || saving) return;
    setSaving(true);
    try {
      const resp = await fetch(`/api/editor/page/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc: editor.getJSON() }),
      });
      const data = await resp.json();
      setSaveStatus(data.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 2000);
    }
  }, [editor, pageId, saving]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  // Scroll to anchor after page content loads
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || loading) return;
    setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 150);
  }, [loading]);

  const handleInsertFigure = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: 'figure', attrs: { src: '', caption: '' } }).run();
  }, [editor]);

  // Show link popup on click; dismiss on outside click
  const handleContentClick = useCallback((e) => {
    const il = e.target.closest('[data-internal-link]');
    if (il) {
      e.preventDefault();
      const id = il.getAttribute('data-internal-link');
      const rect = il.getBoundingClientRect();
      setLinkPopup({ x: rect.left, y: rect.bottom + 4, id, href: null });
      return;
    }
    const a = e.target.closest('a[href]');
    if (a) {
      e.preventDefault();
      const href = a.getAttribute('href');
      const rect = a.getBoundingClientRect();
      setLinkPopup({ x: rect.left, y: rect.bottom + 4, href, id: null });
      return;
    }
    setLinkPopup(null);
  }, []);

  if (!pageId) return <div className={styles.empty}>← Select a page from the left to start editing</div>;

  return (
    <div className={styles.pageEditor}>
      <div className={styles.topBar}>
        <EditorToolbar editor={editor} onInsertFigure={handleInsertFigure} />
        <div className={styles.saveArea}>
          {saveStatus === 'saved' && <span className={styles.saved}>Saved ✓</span>}
          {saveStatus === 'error' && <span className={styles.saveErr}>Save failed ✕</span>}
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading…</div>}
      {error && <div className={styles.error}>Error: {error}</div>}
      {!loading && !error && (
        <EditorContent editor={editor} className={styles.editorContent} onClick={handleContentClick} />
      )}

      {linkPopup && (
        <LinkPopup
          popup={linkPopup}
          editor={editor}
          navigate={navigate}
          onClose={() => setLinkPopup(null)}
        />
      )}
    </div>
  );
}
