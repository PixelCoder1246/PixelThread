import type { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Maintenance — PixelThread',
};

export default function MaintenancePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Wrench size={48} />
        </div>
        <h1 className={styles.title}>Under maintenance</h1>
        <p className={styles.description}>
          We&apos;re performing some upgrades. We&apos;ll be back shortly.
        </p>
      </div>
    </div>
  );
}
