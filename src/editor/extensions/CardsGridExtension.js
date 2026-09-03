import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CardsGridView } from './CardsGridView.jsx';

export const CardsGridExtension = Node.create({
  name: 'cardsGrid',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      cards: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute('data-cards') || '[]');
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => {
          return ['data-cards', JSON.stringify(attrs.cards)];
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="cards-grid"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      { ...HTMLAttributes, 'data-type': 'cards-grid' },
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardsGridView);
  },

  addCommands() {
    return {
      insertCardsGrid:
        (cards = []) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { cards },
          });
        },
    };
  },
});
