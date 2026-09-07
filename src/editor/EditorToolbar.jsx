import { useState, useEffect } from 'react';
import styles from './EditorToolbar.module.css';
import { InternalLinkPicker } from './InternalLinkPicker.jsx';

const ToolBtn = ({ active, title, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    className={`${styles.btn} ${active ? styles.active : ''}`}
  >
    {children}
  </button>
);

const Sep = () => <span className={styles.sep} />;

const CALLOUT_TYPES = [
  { type: 'info',  icon: 'i' },
  { type: 'tip',   icon: 't' },
  { type: 'alarm', icon: '!' },
];

// Floating panel for choosing link type, anchored below the trigger button
function LinkTypePopup({ anchor, onExternal, onInternal, onClose }) {
  return (
    <>
      <div className={styles.popupOverlay} onClick={onClose} />
      <div className={styles.linkPopup} style={{ left: anchor.x, top: anchor.y }}>
        <button onClick={onExternal}>External</button>
        <button onClick={onInternal}>Internal</button>
      </div>
    </>
  );
}

export function EditorToolbar({ editor, onInsertFigure }) {
  // Force re-render when cursor moves so isActive() reflects current position
  const [, forceUpdate] = useState(0);
  const [linkAnchor, setLinkAnchor] = useState(null);
  const [internalPickerAnchor, setInternalPickerAnchor] = useState(null);

  useEffect(() => {
    if (!editor) return;
    const update = () => forceUpdate((n) => n + 1);
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => { editor.off('selectionUpdate', update); editor.off('transaction', update); };
  }, [editor]);

  if (!editor) return null;

  const chain = () => editor.chain().focus();

  const isLinkActive = editor.isActive('link') || editor.isActive('internalLink');

  const handleAnnotation = () => {
    const current = editor.getAttributes('annotation').note ?? '';
    const note = window.prompt('Annotation note', current);
    if (note === null) return;
    if (note === '') chain().unsetMark('annotation').run();
    else chain().setMark('annotation', { note }).run();
  };
  const handleLinkBtn = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLinkAnchor({ x: rect.left, y: rect.bottom + 4 });
  };

  const handleExternal = () => {
    const url = window.prompt('URL', editor.getAttributes('link').href ?? 'https://');
    if (url === null) { setLinkAnchor(null); return; }
    if (url === '') chain().unsetLink().run();
    else chain().setLink({ href: url, target: '_blank' }).run();
    setLinkAnchor(null);
  };

  const handleInternal = () => {
    setInternalPickerAnchor(linkAnchor);
    setLinkAnchor(null);
  };

  return (
    <div className={styles.toolbar}>
      <ToolBtn title="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}>
        <b>B</b>
      </ToolBtn>
      <ToolBtn title="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}>
        <i>I</i>
      </ToolBtn>
      <ToolBtn title="Code" active={editor.isActive('code')} onClick={() => chain().toggleCode().run()}>
        {'</>'}
      </ToolBtn>

      <Sep />

      <ToolBtn title="Annotation" active={editor.isActive('annotation')} onClick={handleAnnotation}>Note</ToolBtn>
      <ToolBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => chain().toggleHeading({ level: 1 }).run()}>H1</ToolBtn>
      <ToolBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
      <ToolBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>
      <ToolBtn title="Heading 4" active={editor.isActive('heading', { level: 4 })} onClick={() => chain().toggleHeading({ level: 4 }).run()}>H4</ToolBtn>

      <Sep />

      <ToolBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}>UL</ToolBtn>
      <ToolBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}>1.</ToolBtn>
      <ToolBtn title="Task list" active={editor.isActive('taskList')} onClick={() => chain().toggleTaskList().run()}>Task</ToolBtn>
      <ToolBtn title="Default list color" active={editor.isActive('listItem', { color: null })} onClick={() => chain().updateAttributes('listItem', { color: null }).run()}>A</ToolBtn>
      <ToolBtn title="Green list item" active={editor.isActive('listItem', { color: 'green' })} onClick={() => chain().updateAttributes('listItem', { color: 'green' }).run()}>Green</ToolBtn>
      <ToolBtn title="Red list item" active={editor.isActive('listItem', { color: 'red' })} onClick={() => chain().updateAttributes('listItem', { color: 'red' }).run()}>Red</ToolBtn>

      <Sep />

      <ToolBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}>"</ToolBtn>
      {CALLOUT_TYPES.map(({ type, icon }) => (
        <ToolBtn
          key={type}
          title={`Callout (${type})`}
          active={editor.isActive('callout', { calloutType: type })}
          onClick={() => chain().insertContent({
            type: 'callout',
            attrs: { calloutType: type },
            content: [{ type: 'paragraph' }],
          }).run()}
        >
          {icon}
        </ToolBtn>
      ))}
      <ToolBtn title="Insert figure" onClick={onInsertFigure}>Figure</ToolBtn>
      <ToolBtn title="Insert cards grid" onClick={() => editor.commands.insertCardsGrid()}>Cards</ToolBtn>

      <Sep />

      <ToolBtn title="Divider" onClick={() => chain().setHorizontalRule().run()}>---</ToolBtn>
      <ToolBtn title="Link" active={isLinkActive} onClick={handleLinkBtn}>Link</ToolBtn>

      <Sep />

      <ToolBtn title="Undo" onClick={() => chain().undo().run()}>Undo</ToolBtn>
      <ToolBtn title="Redo" onClick={() => chain().redo().run()}>Redo</ToolBtn>

      {internalPickerAnchor && (
        <InternalLinkPicker
          anchor={internalPickerAnchor}
          initialValue={editor.getAttributes('internalLink').id ?? ''}
          onSelect={(id) => {
            if (id) chain().setMark('internalLink', { id }).run();
            else chain().unsetMark('internalLink').run();
            setInternalPickerAnchor(null);
          }}
          onClose={() => setInternalPickerAnchor(null)}
        />
      )}
      {linkAnchor && (
        <LinkTypePopup
          anchor={linkAnchor}
          onExternal={handleExternal}
          onInternal={handleInternal}
          onClose={() => setLinkAnchor(null)}
        />
      )}
    </div>
  );
}
