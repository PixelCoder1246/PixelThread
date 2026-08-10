'use client';

import React from 'react';
import styles from './AITypingIndicator.module.css';

export default function AITypingIndicator() {
  return (
    <div className={styles.indicator} aria-label="AI is typing" role="status">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className="sr-only">Generating response...</span>
    </div>
  );
}
