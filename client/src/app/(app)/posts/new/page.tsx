'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PostEditor } from '@/components/editor/PostEditor';

export default function NewPostPage() {
  return (
    <ProtectedRoute requireVerified>
      <PostEditor />
    </ProtectedRoute>
  );
}
