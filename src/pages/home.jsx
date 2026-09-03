import React, { useMemo } from 'react';
import { renderTiptapDoc } from '@/utils/render-tiptap.js';
import styles from './home.module.css';
import homeContent from '@/config/home-content.json';

export default function Page({ go }) {
  const contentElements = useMemo(() => renderTiptapDoc(homeContent, { go }), [go]);
  
  return (
    <div>
      {contentElements}
    </div>
  );
}
