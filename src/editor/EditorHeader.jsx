import { idToPath } from '@/config/nav.js';
import styles from './EditorHeader.module.css';

export function EditorHeader({ isDirty, onSaveNav, pageId }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.icon}>OK</span>
        <span className={styles.title}>Editor</span>
        {isDirty && <span className={styles.dirty}>Unsaved</span>}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.saveNavBtn}
          onClick={onSaveNav}
          title="Save navigation structure"
        >
          Save Nav
        </button>
        <a
          href={idToPath[pageId] || '/'}
          className={styles.siteLink}
          target="_blank"
          rel="noreferrer"
        >
          View Site
        </a>
      </div>
    </header>
  );
}
