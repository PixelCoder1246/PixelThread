'use client';

import { TechText } from '@/components/ui/TechText';
import { PostCardSkeleton, PostCardSkeletonSm } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import Link from 'next/link';
import {
  ArrowRight,
  PenTool,
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
  Globe,
  Database,
  Network,
  Brain,
  Palette,
  Terminal,
  Rocket,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { usePosts } from '@/features/posts/usePosts';
import { PostCard } from '@/components/post/PostCard';
import type { PostListItem } from '@/types/post';
import './page.css';

const features = [
  {
    icon: Brain,
    title: 'AI Writing Assistant',
    description:
      'Generate, improve, and optimize your content with AI-powered writing tools including blog generation, SEO optimization, and content improvement.',
    gradient: 'bg-slate-600 to-slate-800',
    glowColor: 'bg-slate-600 to-slate-800',
  },
  {
    icon: PenTool,
    title: 'Rich Text Editor',
    description:
      'Create beautiful posts with our TipTap-powered editor supporting images, code blocks, tables, and markdown.',
    gradient: 'bg-slate-600 to-slate-800',
    glowColor: 'bg-slate-600 to-slate-800',
  },
  {
    icon: Palette,
    title: 'Design System',
    description:
      "Built-in design tokens, themes, and components. Customize your blog's look without writing CSS.",
    gradient: 'bg-slate-600 to-slate-800',
    glowColor: 'bg-slate-600 to-slate-800',
  },
  {
    icon: Users,
    title: 'Community Features',
    description:
      'Follow writers, bookmark posts, leave comments, and build your audience with built-in social features.',
    gradient: 'bg-slate-600 to-slate-800',
    glowColor: 'bg-slate-600 to-slate-800',
  },
  {
    icon: BookOpen,
    title: 'SEO Optimized',
    description:
      'Built-in SEO tools, meta tags, sitemaps, and structured data to help your content rank higher.',
    gradient: 'bg-slate-600 to-slate-800',
    glowColor: 'bg-slate-600 to-slate-800',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description:
      'Track your post performance with detailed analytics, views, likes, and reader insights.',
    gradient: 'bg-slate-600 to-slate-800',
    glowColor: 'bg-slate-600 to-slate-800',
  },
];

const techStack = [
  { name: 'Next.js', icon: Rocket },
  { name: 'React', icon: Layers },
  { name: 'TypeScript', icon: Terminal },
  { name: 'Tailwind CSS', icon: Palette },
  { name: 'TipTap', icon: PenTool },
  { name: 'TanStack Query', icon: Database },
  { name: 'PostgreSQL', icon: Database },
];

function adaptHomePost(p: unknown): PostListItem {
  const post = p as Record<string, unknown>;
  const tags = (post.tags as unknown[]) ?? [];
  const normalizedTags = tags.map((t) => {
    const tag = t as Record<string, unknown>;
    if (tag.tag) return tag as { tag: { id: string; name: string } };
    return {
      tag: { id: (tag.id as string) ?? '', name: (tag.name as string) ?? '' },
    };
  });

  return {
    id: post.id as string,
    title: post.title as string,
    slug: post.slug as string,
    excerpt: (post.excerpt as string | null) ?? null,
    content: (post.content as PostListItem['content']) ?? [],
    status: (post.status as PostListItem['status']) ?? 'PUBLISHED',
    visibility: (post.visibility as PostListItem['visibility']) ?? 'PUBLIC',
    authorId: (post.authorId as string) ?? '',
    author: post.author as PostListItem['author'],
    tags: normalizedTags,
    createdAt: post.createdAt as string,
    updatedAt: (post.updatedAt as string) ?? (post.createdAt as string),
    featured: (post.featured as boolean) ?? false,
    pinned: (post.pinned as boolean) ?? false,
    analytics: (post.analytics as PostListItem['analytics']) ?? undefined,
    _count: (post._count as PostListItem['_count']) ?? undefined,
  };
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: postsData, isLoading: postsLoading } = usePosts(1, 3);
  const latestPosts = (postsData?.posts ?? []).map(adaptHomePost);

  return (
    <div className="landing-page">
      {/* Background Layers */}
      <div className="landing-bg">
        <div className="landing-glow-1" />
        <div className="landing-glow-2" />
        <div className="landing-glow-3" />
        <div className="landing-grid" />
        <FloatingParticles count={12} />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero-content">
            {/* Animated Logo */}
            <div className="hero-logo">
              <div className="hero-logo-glow" />
              <div className="relative z-10 min-h-[300px] flex items-center justify-center">
                <TechText
                  text="PixelThread"
                  fontSize={180}
                  fontWeight={800}
                  letterSpacing={-0.01}
                  color="#f1f5f9"
                  accentColor="#64748b"
                  reach={400}
                  softness={0.45}
                  dashLength={5}
                  dashGap={4}
                  strokeWidth={2.5}
                  lineStyle="dashed"
                  reveal="letter"
                  specks={30}
                  selection={true}
                  labels={false}
                  draggable={true}
                  sweep={true}
                  speed={0.9}
                  className="w-full max-w-6xl mx-auto relative z-10"
                  style={{ height: '280px' }}
                />
              </div>
            </div>

            {/* Tagline */}
            <div className="hero-tagline relative z-10">
              <Link href="/posts" className="hero-public-badge">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>
                  Public Feed: Explore stories & tech articles without logging
                  in &rarr;
                </span>
              </Link>
              <p className="hero-tagline-text">
                The AI-powered blogging platform where{' '}
                <span className="hero-tagline-highlight">creators</span> and{' '}
                <span className="hero-tagline-highlight">developers</span> write
                smarter, publish faster, and grow together.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="hero-cta relative z-10">
              <Link href="/posts" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-3 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg relative overflow-hidden group bg-gradient-btn-primary hover:bg-gradient-btn-primary-hover shadow-glow hover:shadow-glow-hover border border-primary transition-all duration-300 hover:-translate-y-1"
                >
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
                  <span className="relative z-10 font-medium tracking-wide">
                    Explore All Posts
                  </span>
                  <div className="absolute inset-0 bg-gradient-btn-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>

              {isAuthenticated ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-3 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg border-secondary hover:border-slate-500/40 hover:bg-hover bg-hover-strong backdrop-blur-sm text-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
                  >
                    <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/posts/new" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-3 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg border-secondary hover:border-slate-500/40 hover:bg-hover bg-hover-strong backdrop-blur-sm text-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
                  >
                    <PenTool className="h-5 w-5 sm:h-6 sm:w-6" />
                    Write a Story
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <div className="features-header">
              <h2 className="features-title">
                Everything you need to{' '}
                <span className="features-title-highlight">
                  create, publish & grow
                </span>
              </h2>
              <p className="features-subtitle">
                Powerful features designed for modern writers, developers, and
                content creators.
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, i) => (
                <Card
                  key={feature.title}
                  className="group feature-card relative overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-card-hover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative p-8 h-full flex flex-col">
                    <div className="relative mb-6 flex items-center justify-center feature-icon-wrapper">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${feature.gradient} group-hover:scale-110 transition-transform duration-300 relative z-10 mx-auto feature-icon-bg`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div
                        className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-full ${feature.glowColor} opacity-10 group-hover:opacity-20 transition-opacity -z-10 feature-icon-glow`}
                      />
                    </div>
                    <h3 className="feature-title text-xl font-bold mb-3 text-primary">
                      {feature.title}
                    </h3>
                    <p className="feature-description text-muted leading-relaxed flex-1">
                      {feature.description}
                    </p>
                    <div className="feature-footer mt-6 pt-6 border-t border-primary">
                      <span className="feature-link text-sm font-medium text-muted group-hover:text-secondary transition-colors">
                        Learn more &rarr;
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="tech-section">
          <div className="tech-container">
            <div className="features-header">
              <h2 className="features-title">Built with modern technology</h2>
              <p className="features-subtitle">
                Our stack is carefully chosen for performance, developer
                experience, and scalability.
              </p>
            </div>

            <div className="tech-grid">
              {techStack.map((tech, i) => (
                <div
                  key={tech.name}
                  className="tech-item"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="tech-icon-wrapper">
                    <tech.icon className="tech-icon" />
                  </div>
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <div className="cta-inner">
              <div className="cta-card relative rounded-3xl p-10 md:p-16 overflow-hidden">
                <div className="cta-card-glow" />
                <div className="cta-card-glow-top" />

                <div className="cta-content">
                  <div className="cta-badge">
                    <Sparkles className="h-3.5 w-3.5" />
                    New: AI Writing Assistant
                  </div>
                  <h2 className="cta-title">
                    Ready to write your{' '}
                    <span className="cta-title-highlight">
                      next masterpiece
                    </span>
                    ?
                  </h2>
                  <p className="cta-description">
                    Join the community of creators using PixelThread. Free to
                    start, no credit card required.
                  </p>
                  <div className="cta-buttons">
                    {isAuthenticated ? (
                      <Link href="/dashboard">
                        <Button size="lg" className="cta-btn-primary gap-3">
                          <LayoutDashboard className="h-5 w-5" />
                          Go to Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/register">
                        <Button size="lg" className="cta-btn-primary gap-3">
                          <Rocket className="h-5 w-5" />
                          Create Free Account
                        </Button>
                      </Link>
                    )}
                    <Link href="/posts/new">
                      <Button
                        variant="outline"
                        size="lg"
                        className="cta-btn-secondary gap-3"
                      >
                        <PenTool className="h-5 w-5" />
                        Try the Editor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Posts Preview */}
        <section className="posts-preview-section">
          <div className="posts-preview-container">
            <div className="posts-preview-header">
              <div>
                <h2 className="posts-preview-title">
                  Latest from the community
                </h2>
                <p className="posts-preview-subtitle">
                  Discover what developers and creators are writing about
                </p>
              </div>
              <Link href="/posts">
                <Button
                  variant="ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  View All Posts
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </Button>
              </Link>
            </div>
            <div
              className="posts-skeleton-list"
              role="feed"
              aria-label="Latest posts"
            >
              {postsLoading
                ? [1, 2, 3].map((i) => <PostCardSkeletonSm key={i} />)
                : latestPosts.length > 0
                  ? latestPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  : [1, 2, 3].map((i) => <PostCardSkeletonSm key={i} />)}
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link href="/posts">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-3 px-8 py-4 border-secondary hover:border-slate-500/40 hover:bg-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Browse All Community Posts</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 px-4 relative">
          <div className="container text-center">
            <p className="text-dim mb-4">
              Questions? Feedback? We&apos;d love to hear from you.
            </p>
            <div className="footer-links flex flex-wrap items-center justify-center gap-4 text-sm text-dim/50">
              <a
                href="/docs"
                className="hover:text-secondary transition-colors text-secondary"
              >
                Documentation
              </a>
              <span className="text-white/20">&middot;</span>
              <a
                href="/api-docs"
                className="hover:text-secondary transition-colors text-secondary"
              >
                API Reference
              </a>
              <span className="text-white/20">&middot;</span>
              <a
                href="https://github.com/pixelthread"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors text-secondary"
              >
                GitHub
              </a>
              <span className="text-white/20">&middot;</span>
              <a
                href="https://twitter.com/pixelthread"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors text-secondary"
              >
                Twitter
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
