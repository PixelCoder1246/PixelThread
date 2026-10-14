import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const s = styles as Record<string, string>;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      <div className={s['footer-inner']}>
        <Link href="/" className={s['footer-brand']}>
          <Image
            src="/PTfavicon.png"
            alt="PixelThread"
            width={24}
            height={24}
            className={s['footer-brand-image']}
          />
          <span>PixelThread</span>
        </Link>
        <nav className={s['footer-links']} aria-label="Footer navigation">
          <Link href="/posts/new" className={s['footer-link']}>Write</Link>
          <span className={s['footer-divider']}>·</span>
          <Link href="/search" className={s['footer-link']}>Discover</Link>
          <span className={s['footer-divider']}>·</span>
          <Link href="/tags" className={s['footer-link']}>Topics</Link>
          <span className={s['footer-divider']}>·</span>
          <Link href="/analytics" className={s['footer-link']}>Analytics</Link>
          <span className={s['footer-divider']}>·</span>
          <Link href="/about" className={s['footer-link']}>About</Link>
          <span className={s['footer-divider']}>·</span>
          <Link href="/privacy" className={s['footer-link']}>Privacy</Link>
          <span className={s['footer-divider']}>·</span>
          <Link href="/terms" className={s['footer-link']}>Terms</Link>
        </nav>
        <p className={s['footer-copyright']}>
          &copy; {currentYear} PixelThread. All rights reserved.
        </p>
      </div>
    </footer>
  );
}