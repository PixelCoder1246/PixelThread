'use client';

import { useParams } from 'next/navigation';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { MainLayout } from '@/components/layout/MainLayout';

export default function PostPage() {
  const params = useParams();
  const slug = params.slug;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Post: {slug}</h1>
        <p className="text-muted-foreground">Post content will be displayed here.</p>
        <PostCardSkeleton />
      </div>
    </MainLayout>
  );
}