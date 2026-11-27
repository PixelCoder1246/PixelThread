import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import PostDetailClient from './PostDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPostData(slug: string) {
  try {
    const { postsService } = await import('@/services/posts');
    const post = await postsService.getBySlug(slug);
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post || !post.author) {
    return { title: 'Post Not Found' };
  }

  const ogImage = post.analytics?.views ? undefined : undefined;

  return {
    title: post.title,
    description: post.excerpt || `${post.title} — PixelThread`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.author.name],
      tags: post.tags?.map((t) => t.name),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${post.slug}`,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    image: undefined,
    publisher: {
      '@type': 'Organization',
      name: 'PixelThread',
    },
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient post={post} />
    </>
  );
}
