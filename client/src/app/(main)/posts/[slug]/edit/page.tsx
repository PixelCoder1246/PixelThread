'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug;

  return (
    <ProtectedRoute requireVerified>
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Edit Post: {slug}</h1>
          <p className="text-muted-foreground">
            Post editor will be implemented in Phase 2.
          </p>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
