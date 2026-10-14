'use client';

import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NewPostPage() {
  return (
    <div className={styles.newPostPage}>
      <div className={styles.newPostHeader}>
        <h1>New Post</h1>
        <Link href="/posts/my-posts">
          <Button variant="outline">Back to My Posts</Button>
        </Link>
      </div>
      <div className={styles.newPostForm}>
        <p>Post editor will be implemented in Phase 2.</p>
        <div className={styles.formGroup}>
          <div className={styles.formField}>
            <label>Title</label>
            <input type="text" placeholder="Enter your post title" />
          </div>
          <div className={styles.formField}>
            <label>Content</label>
            <textarea
              placeholder="Write your post content here..."
              className="min-h-[300px]"
            />
          </div>
          <div className={styles.formActions}>
            <Button>Save as Draft</Button>
            <Button variant="outline">Publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
