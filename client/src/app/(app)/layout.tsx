import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Spinner } from '@/components/ui';

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Spinner className="h-8 w-8 mx-auto my-20" />}>
      <ProtectedRoute>
        <MainLayout>{children}</MainLayout>
      </ProtectedRoute>
    </Suspense>
  );
}
