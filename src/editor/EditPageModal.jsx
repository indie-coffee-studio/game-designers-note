import { useState, useCallback } from 'react';
import styles from './NewPageModal.module.css';

function flattenForSelect(nodes, currentId, depth = 0) {
  const result = [];
  for (const node of nodes) {
    if (node.id !== 'home' && node.id !== currentId) result.push({ id: node.id, label: node.label, depth });
    if (node.children) result.push(...flattenForSelect(node.children, currentId, depth + 1));
  }
  return result;
}

export function EditPageModal({ navData, item, onClose, onUpdated }) {
  const [label, setLabel] = useState(item.label);
  const [id, setId] = useState(item.id);
  const [parentId, setParentId] = useState(item.parentId ?? '');
  const [icon, setIcon] = useState(item.icon ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const options = flattenForSelect(navData, item.id);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!label.trim() || !id.trim()) { setError('Title and ID are required'); return; }
    setSaving(true);
    setError('');
    try {
      const resp = await fetch(`/api/editor/page/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.trim(), label: label.trim(), parentId: parentId || null, icon: icon.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) setError(data.error ?? 'Update failed');
      else onUpdated(data.id);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [id, item.id, label, icon, onUpdated, parentId]);

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Edit Page</h2>
        <form onSubmit={handleSubmit}>
          <label className={styles.field}><span>Title *</span><input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} /></label>
          <label className={styles.field}><span>ID *</span><input value={id} onChange={(e) => setId(e.target.value)} /></label>
          <label className={styles.field}>
            <span>Parent</span>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">Root</option>
              {options.map((opt) => <option key={opt.id} value={opt.id}>{'  '.repeat(opt.depth)}{opt.label}</option>)}
            </select>
          </label>
          <label className={styles.field}><span>Icon <small>(FontAwesome name, optional)</small></span><input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. gamepad" /></label>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.create} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}