import { useEffect, useState, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import styles from './CardsGridView.module.css';

export function CardsGridView({ node, updateAttributes, selected }) {
  const [cards, setCards] = useState(node.attrs.cards || []);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    setCards(node.attrs.cards || []);
  }, [node.attrs.cards]);

  const handleUpdateCards = useCallback((newCards) => {
    setCards(newCards);
    updateAttributes({ cards: newCards });
  }, [updateAttributes]);

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    handleUpdateCards(newCards);
  };

  const addCard = () => {
    const newCards = [...cards, { id: `card-${Date.now()}`, title: 'New Card', image: '' }];
    handleUpdateCards(newCards);
  };

  const removeCard = (index) => {
    const newCards = cards.filter((_, i) => i !== index);
    handleUpdateCards(newCards);
  };

  return (
    <NodeViewWrapper className={styles.wrapper} data-drag-handle>
      <div className={`${styles.container} ${selected ? styles.selected : ''}`}>
        <div className={styles.header}>
          <span className={styles.label}>📇 Cards Grid</span>
          <button onClick={addCard} className={styles.addBtn}>+ Add Card</button>
        </div>

        <div className={styles.preview}>
          <div className={styles.grid}>
            {cards.map((card, i) => (
              <div key={i} className={styles.card}>
                {card.image && (
                  <div className={styles.cardImage}>
                    <img src={card.image} alt={card.title} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <div className={styles.cardTitle}>{card.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.editorPanel}>
          {cards.map((card, i) => (
            <div
              key={i}
              className={`${styles.cardEditor} ${editingIndex === i ? styles.editing : ''}`}
              onClick={() => setEditingIndex(i)}
            >
              <div className={styles.cardEditorContent}>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(i, 'title', e.target.value)}
                  placeholder="Card title"
                  className={styles.titleInput}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="text"
                  value={card.image}
                  onChange={(e) => updateCard(i, 'image', e.target.value)}
                  placeholder="Image URL"
                  className={styles.imageInput}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="text"
                  value={card.id}
                  onChange={(e) => updateCard(i, 'id', e.target.value)}
                  placeholder="Card ID"
                  className={styles.idInput}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeCard(i); }}
                className={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
