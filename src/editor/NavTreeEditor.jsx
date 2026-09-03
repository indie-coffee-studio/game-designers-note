import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flattenTree, buildTree } from './treeUtils.js';
import { EditPageModal } from './EditPageModal.jsx';
import styles from './NavTreeEditor.module.css';

// 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?SortableItem 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕

function SortableItem({ item, isSelected, isExpanded, onSelect, onToggle, onContextMenu }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const indent = item.depth * 14;
  const hasChildren = !!item._hasChildren;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-nav-id={item.id}
      className={`${styles.item} ${isSelected ? styles.selected : ''}`}
    >
      <div
        className={styles.row}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => onSelect(item.id)}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, item); }}
      >
        <span
          className={styles.handle}
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          ::
        </span>
        {hasChildren && (
          <span
            className={styles.toggle}
            onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
          >
            {isExpanded ? '-' : '+'}
          </span>
        )}
        {!hasChildren && <span className={styles.togglePlaceholder} />}
        <span className={styles.label}>{item.label}</span>
      </div>
    </div>
  );
}

// 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?Context menu 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕

function ContextMenu({ x, y, item, onEdit, onRename, onDelete, onAddChild, onClose }) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.contextMenu} style={{ top: y, left: x }}>
        <button onClick={() => { onEdit(item); onClose(); }}>Edit page info</button>
        <button onClick={() => { onRename(item); onClose(); }}>Rename label</button>
        <button onClick={() => { onAddChild(item); onClose(); }}>New child page</button>
        <button className={styles.danger} onClick={() => { onDelete(item); onClose(); }}>Delete</button>
      </div>
    </>
  );
}

// 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?NavTreeEditor 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?

function getAncestorIds(nodes, targetId, path = []) {
  for (const node of nodes) {
    if (node.id === targetId) return path.map((n) => n.id);
    if (node.children) {
      const found = getAncestorIds(node.children, targetId, [...path, node]);
      if (found) return found;
    }
  }
  return null;
}

export function NavTreeEditor({ navData, selectedId, onSelect, onNavChange, onNewPage }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(['gameplay-design', 'game-experience', 'game-development', 'level-design', 'narrative-design', 'appendix']));
  const [contextMenu, setContextMenu] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Auto-expand ancestors and scroll to selected item when selectedId changes
  useEffect(() => {
    if (!selectedId || !navData) return;
    const ancestors = getAncestorIds(navData, selectedId) ?? [];
    if (ancestors.length) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestors.forEach((id) => next.add(id));
        return next;
      });
    }
    setTimeout(() => {
      document.querySelector(`[data-nav-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest' });
    }, 60);
  }, [selectedId, navData]);

  // Build flat list including only visible items (respecting expand/collapse)
  const { flatItems, childrenMap } = useMemo(() => {
    const childrenMap = new Map();

    function addChildren(nodes, parentId) {
      for (const node of nodes) {
        if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
        childrenMap.get(parentId).push(node.id);
        if (node.children) addChildren(node.children, node.id);
      }
    }
    if (navData) addChildren(navData, null);

    // DFS traversal respecting expanded state
    const result = [];
    function visit(nodes, depth, parentId = null) {
      for (const node of nodes) {
        const hasChildren = !!(node.children?.length);
        result.push({ ...node, depth, parentId, _hasChildren: hasChildren, children: undefined });
        if (hasChildren && expandedIds.has(node.id)) visit(node.children, depth + 1, node.id);
      }
    }
    if (navData) visit(navData, 0, null);
    return { flatItems: result, childrenMap };
  }, [navData, expandedIds]);

  const handleToggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleContextMenu = useCallback((e, item) => {
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const handleRename = useCallback((item) => {
    const newLabel = window.prompt('New name', item.label);
    if (!newLabel || newLabel === item.label) return;
    const update = (nodes) => nodes.map((n) => {
      if (n.id === item.id) return { ...n, label: newLabel };
      if (n.children) return { ...n, children: update(n.children) };
      return n;
    });
    onNavChange(update(navData));
  }, [navData, onNavChange]);

  const handleEdit = useCallback((item) => setEditItem(item), []);

  const handlePageUpdated = useCallback((newId) => {
    setEditItem(null);
    fetch('/api/editor/nav').then((r) => r.json()).then((data) => {
      onNavChange(data);
      onSelect(newId);
    });
  }, [onNavChange, onSelect]);
  const handleDelete = useCallback((item) => {
    if (!window.confirm(`Delete "${item.label}"? This will also delete the corresponding JSX file.`)) return;
    fetch(`/api/editor/page/${item.id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then(({ ok, error }) => {
        if (ok) {
          // Reload nav from server (it was already updated by the API)
          fetch('/api/editor/nav').then((r) => r.json()).then(onNavChange);
        } else {
          alert(`Delete failed: ${error}`);
        }
      });
  }, [onNavChange]);

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?DnD 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜?

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    // Rebuild full tree from flat items, then move
    const fullFlat = flattenTree(navData);
    const activeIdx = fullFlat.findIndex((n) => n.id === active.id);
    const overIdx   = fullFlat.findIndex((n) => n.id === over.id);
    if (activeIdx === -1 || overIdx === -1) return;

    // Remove active, insert after over
    const item = fullFlat.splice(activeIdx, 1)[0];
    const insertAt = fullFlat.findIndex((n) => n.id === over.id) + 1;
    // Keep same depth as the item at overIdx (sibling reorder)
    const targetItem = fullFlat[overIdx < activeIdx ? overIdx : overIdx - 1] ?? fullFlat[overIdx];
    item.parentId = targetItem?.parentId ?? null;
    item.depth = targetItem?.depth ?? 0;
    fullFlat.splice(insertAt, 0, item);

    onNavChange(buildTree(fullFlat));
  }, [navData, onNavChange]);

  const activeItem = flatItems.find((i) => i.id === activeId);

  if (!navData) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.navTree}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Pages</span>
        <button className={styles.newPageBtn} onClick={() => onNewPage(null)} title="New page">+</button>
      </div>

      <div className={styles.treeBody}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {flatItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                isExpanded={expandedIds.has(item.id)}
                onSelect={onSelect}
                onToggle={handleToggle}
                onContextMenu={handleContextMenu}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeItem && (
              <div className={`${styles.item} ${styles.dragging}`}>
                <div className={styles.row} style={{ paddingLeft: `${8 + activeItem.depth * 14}px` }}>
                  <span className={styles.handle}>::</span>
                  <span className={styles.label}>{activeItem.label}</span>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onEdit={handleEdit}
          onRename={handleRename}
          onDelete={handleDelete}
          onAddChild={(item) => onNewPage(item.id)}
          onClose={() => setContextMenu(null)}
        />
      )}
      {editItem && (
        <EditPageModal
          navData={navData}
          item={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={handlePageUpdated}
        />
      )}
    </div>
  );
}
