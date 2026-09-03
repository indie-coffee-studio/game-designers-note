/**
 * Render a TipTap document JSON to React components
 * Used by home page and other content-heavy pages to display edited content
 */

import React from 'react';
import { 
  P, H1, H2, H3, H4, 
  UL, OL, LI, 
  Blockquote, Callout, 
  ExtLink, InternalLink,
  HR, CheckList, CheckItem, Figure
} from '@/components/ui.jsx';

const NODE_TO_COMPONENT = {
  paragraph: P,
  heading: (level) => {
    const components = { 1: H1, 2: H2, 3: H3, 4: H4 };
    return components[level] || H4;
  },
  bulletList: UL,
  orderedList: OL,
  listItem: LI,
  blockquote: Blockquote,
  callout: Callout,
  horizontalRule: HR,
  taskList: CheckList,
  taskItem: CheckItem,
  figure: Figure,
};

function renderMarks(text, marks = []) {
  let content = text;
  for (const mark of marks || []) {
    if (mark.type === 'bold') {
      content = React.createElement('strong', null, content);
    } else if (mark.type === 'italic') {
      content = React.createElement('em', null, content);
    } else if (mark.type === 'code') {
      content = React.createElement('code', null, content);
    } else if (mark.type === 'link') {
      content = React.createElement(ExtLink, { href: mark.attrs?.href }, content);
    } else if (mark.type === 'internalLink') {
      content = React.createElement(InternalLink, { id: mark.attrs?.id }, content);
    }
  }
  return content;
}

function renderContent(nodes, context = {}) {
  if (!nodes) return null;
  
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      return renderMarks(node.text, node.marks);
    }

    // Special handling for cardsGrid
    if (node.type === 'cardsGrid') {
      const cards = node.attrs?.cards || [];
      const go = context.go || (() => {});
      
      return React.createElement(
        'div',
        { key: i, style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '16px 0' } },
        cards.map((card) =>
          React.createElement(
            'button',
            {
              key: card.id,
              type: 'button',
              onClick: () => go(card.id),
              style: {
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              },
              onMouseEnter: (e) => { e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'; },
              onMouseLeave: (e) => { e.target.style.boxShadow = 'none'; },
            },
            React.createElement(
              'div',
              {
                style: {
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#f0f0f0',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
              card.image &&
                React.createElement('img', {
                  src: card.image,
                  alt: card.title,
                  style: { width: '100%', height: '100%', objectFit: 'cover' },
                  onError: (e) => { e.target.style.display = 'none'; },
                })
            ),
            React.createElement(
              'div',
              {
                style: {
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  textAlign: 'center',
                  color: '#333',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              },
              card.title
            )
          )
        )
      );
    }

    const Component = node.type === 'heading'
      ? NODE_TO_COMPONENT.heading(node.attrs?.level)
      : NODE_TO_COMPONENT[node.type];

    if (!Component) {
      console.warn(`Unknown node type: ${node.type}`);
      return null;
    }

    const props = { key: i };
    if (node.type === 'heading') props.level = node.attrs?.level;
    if (node.type === 'callout') props.type = node.attrs?.calloutType;
    if (node.type === 'figure') {
      props.src = node.attrs?.src;
      props.caption = node.attrs?.caption;
    }

    return React.createElement(Component, props, renderContent(node.content, context));
  });
}

export function renderTiptapDoc(doc, context = {}) {
  if (!doc || !doc.content) return null;
  return renderContent(doc.content, context);
}
