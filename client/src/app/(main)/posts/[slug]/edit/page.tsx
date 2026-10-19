'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PostEditor } from '@/components/editor/PostEditor';
import { usePost } from '@/features/posts/usePosts';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/useAuth';

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading, isError } = usePost(slug);
  const post = data?.post;

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Post not found</h2>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
          The post you are trying to edit does not exist or has been removed.
        </p>
      </div>
    );
  }

  // Ensure only author or admin can edit
  const canEdit = user?.id === post.authorId || user?.role === 'ADMIN';
  if (user && !canEdit) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Unauthorized</h2>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
          You do not have permission to edit this story.
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute requireVerified>
      <PostEditor initialData={post} isEditing />
    </ProtectedRoute>
  );
}
