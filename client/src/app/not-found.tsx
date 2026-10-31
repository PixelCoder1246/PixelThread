import Link from 'next/link';
import { Compass, Home, Search, ArrowLeft } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>
          <span className={styles.badgeDot}></span>
          <span>404 Error</span>
        </div>

        <h1 className={styles.title}>Thread Not Found</h1>
        <p className={styles.description}>
          The story or page you were looking for doesn&apos;t exist, has been
          removed, or might have moved to another URL.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <Link href="/posts" className={styles.secondaryBtn}>
            <Compass className="h-4 w-4" />
            <span>Explore Posts</span>
          </Link>
          <Link href="/search" className={styles.ghostBtn}>
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
