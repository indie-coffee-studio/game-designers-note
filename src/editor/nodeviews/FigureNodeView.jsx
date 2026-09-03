import { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export function FigureNodeView({ node, updateAttributes, selected }) {
  const { src, caption } = node.attrs;
  const [editingCaption, setEditingCaption] = useState(false);
  const [editingSrc, setEditingSrc] = useState(false);
  const [filename, setFilename] = useState(src.split('/').pop() || '');

  const renameImage = async () => {
    const oldName = src.split('/').pop();
    if (!oldName || !filename || filename === oldName) {
      setEditingSrc(false);
      return;
    }
    const response = await fetch('/api/editor/images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName: filename }),
    });
    const result = await response.json();
    if (!response.ok) return;
    updateAttributes({ src: result.src });
    setEditingSrc(false);
  };

  return (
    <NodeViewWrapper>
      <figure
        style={{ margin: '12px 0', textAlign: 'center', outline: selected ? '2px solid #4a90d9' : 'none', borderRadius: '4px' }}
      >
        {src ? (
          <img src={src} alt={caption} style={{ maxWidth: '100%', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { setFilename(src.split('/').pop() || ''); setEditingSrc(true); }} />
        ) : (
          <div
            onClick={() => setEditingSrc(true)}
            style={{ border: '2px dashed #ccc', borderRadius: '4px', padding: '24px', cursor: 'pointer', color: '#888' }}
          >
            Click to set image URL
          </div>
        )}
        {editingSrc && (
          <input
            autoFocus
            value={filename}
            placeholder="image-name.jpg"
            style={{ display: 'block', width: '100%', marginTop: '4px', padding: '4px 8px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
            onChange={(e) => setFilename(e.target.value)}
            onBlur={renameImage}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }}
          />
        )}
        <figcaption
          style={{ fontSize: '12px', color: '#888', marginTop: '4px', cursor: 'text' }}
          onClick={() => setEditingCaption(true)}
        >
          {editingCaption ? (
            <input
              autoFocus
              defaultValue={caption}
              placeholder="Caption (optional)"
              style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', fontSize: '12px', color: '#888', textAlign: 'center', width: '100%' }}
              onBlur={(e) => { updateAttributes({ caption: e.target.value }); setEditingCaption(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.target.blur(); }}
            />
          ) : (
            caption || <span style={{ opacity: 0.4 }}>Add caption…</span>
          )}
        </figcaption>
      </figure>
    </NodeViewWrapper>
  );
}
