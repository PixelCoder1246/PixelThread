'use client';

import React from 'react';
import { GitBranch, MessageCircle, Briefcase, Play } from 'lucide-react';
import Link from 'next/link';
import styles from './PublicFooter.module.css';

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
];

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com', icon: GitBranch },
  { label: 'Twitter', href: 'https://twitter.com', icon: MessageCircle },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Briefcase },
  { label: 'YouTube', href: 'https://youtube.com', icon: Play },
];

export default function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              PixelThread
            </Link>
            <p className={styles.tagline}>
              The modern platform for creators to write, share, and grow their audience with
              intelligent tools and beautiful publishing.
            </p>
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Product</span>
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Company</span>
            {companyLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Legal</span>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Social</span>
            <div className={styles.socialLinks}>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={link.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} PixelThread. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
