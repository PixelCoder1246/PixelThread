'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Globe,
  Settings,
  BookOpen,
  User,
  Share2,
  FileText,
  Camera,
} from 'lucide-react';
import { useUserProfile, useUserPosts } from '@/features/users/useUser';
import { useUploadCoverImage } from '@/features/settings/useSettings';
import { useAuth } from '@/features/auth/useAuth';
import { FollowButton } from '@/components/user/FollowButton';
import { PostCard } from '@/components/post/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { PostListItem } from '@/types/post';
import styles from './page.module.css';

function TwitterIcon({
  size = 15,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({
  size = 15,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({
  size = 15,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function adaptUserPost(p: unknown): PostListItem {
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

export default function ProfilePage() {
  const params = useParams();
  const idOrUsername = (params.id as string) ?? '';
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [page, setPage] = useState(1);

  const { data: profileData, isLoading: profileLoading } =
    useUserProfile(idOrUsername);
  const user = profileData?.user;

  const { data: postsData, isLoading: postsLoading } = useUserPosts(
    user?.id ?? idOrUsername,
    page,
    10,
    'newest',
    !!user?.id
  );

  const posts = (postsData?.posts ?? []).map(adaptUserPost);
  const pagination = postsData?.pagination;
  const isOwner = currentUser?.id === user?.id;
  const uploadCover = useUploadCoverImage();

  const handleBannerFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        message: 'Cover banner image must not exceed 5MB.',
        type: 'error',
      });
      return;
    }
    try {
      await uploadCover.mutateAsync(file);
      toast({
        title: 'Banner updated',
        message: 'Your banner photo has been updated successfully.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        message:
          err instanceof Error ? err.message : 'Could not upload banner.',
        type: 'error',
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        message: 'Profile link copied to clipboard.',
        type: 'success',
      });
    }
  };

  if (profileLoading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.coverBanner} />
        <div className={styles.profileCard}>
          <div className="py-12 space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.emptyState}>
          <User size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>User Not Found</h2>
          <p className={styles.emptyText}>
            The user you are looking for does not exist or may have deactivated
            their profile.
          </p>
          <div className="mt-4">
            <Link href="/posts">
              <Button>Browse Stories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const socialLinks = (user.socialLinks as Record<string, string> | null) ?? {};
  const formattedJoinedDate = user.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : null;

  return (
    <div className={styles.profilePage}>
      {/* Cover Banner */}
      <div className={styles.coverBanner}>
        {user.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.coverImage}
            alt="Cover"
            className={styles.coverImage}
          />
        )}
        <div className={styles.coverOverlay} />
        {isOwner && (
          <label
            className={styles.changeBannerBtn}
            title="Upload new banner image"
          >
            <Camera size={14} />
            <span>
              {uploadCover.isPending ? 'Updating...' : 'Change Banner'}
            </span>
            <input
              type="file"
              accept="image/*"
              className={styles.hiddenFileInput}
              onChange={handleBannerFileChange}
              disabled={uploadCover.isPending}
            />
          </label>
        )}
      </div>

      {/* Main Profile Info Header */}
      <div className={styles.profileCard}>
        <div className={styles.headerRow}>
          <div className={styles.avatarWrapper}>
            <Avatar
              src={user.image ?? undefined}
              alt={user.name ?? 'User'}
              fallback={(user.name || user.username || 'U')
                .charAt(0)
                .toUpperCase()}
              size="xl"
            />
          </div>

          <div className={styles.actionsGroup}>
            {isOwner ? (
              <Link href="/profile/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings size={14} />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            ) : (
              <FollowButton
                userId={user.id}
                userName={user.name ?? 'user'}
                size="sm"
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              aria-label="Share profile"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>

        <div className={styles.metaInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.profileName}>{user.name || user.username}</h1>
          </div>
          {user.username && (
            <p className={styles.profileUsername}>@{user.username}</p>
          )}

          {user.bio && <p className={styles.profileBio}>{user.bio}</p>}

          <div className={styles.badgesRow}>
            {user.location && (
              <span className={styles.badgeItem}>
                <MapPin size={14} />
                <span>{user.location}</span>
              </span>
            )}

            {user.website && (
              <span className={styles.badgeItem}>
                <Globe size={14} />
                <a
                  href={
                    user.website.startsWith('http')
                      ? user.website
                      : `https://${user.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkItem}
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </span>
            )}

            {formattedJoinedDate && (
              <span className={styles.badgeItem}>
                <Calendar size={14} />
                <span>Joined {formattedJoinedDate}</span>
              </span>
            )}
          </div>

          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {user._count?.posts ?? posts.length}
              </span>
              <span>Stories</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {user._count?.followers ?? 0}
              </span>
              <span>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {user._count?.following ?? 0}
              </span>
              <span>Following</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList} role="tablist">
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'posts' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('posts')}
              role="tab"
              aria-selected={activeTab === 'posts'}
            >
              <FileText size={15} />
              <span>Stories</span>
              <span className={styles.tabCount}>
                {user._count?.posts ?? posts.length}
              </span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'about' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('about')}
              role="tab"
              aria-selected={activeTab === 'about'}
            >
              <User size={15} />
              <span>About</span>
            </button>
          </div>

          {activeTab === 'posts' ? (
            <div className={styles.postsList}>
              {postsLoading ? (
                [1, 2, 3].map((i) => <PostCardSkeleton key={i} />)
              ) : posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <BookOpen size={36} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>
                    No stories published yet
                  </h3>
                  <p className={styles.emptyText}>
                    {isOwner
                      ? "You haven't written any public stories yet. Share your thoughts with the world!"
                      : `${user.name || 'This user'} hasn't published any public stories yet.`}
                  </p>
                  {isOwner && (
                    <div className="mt-4">
                      <Link href="/posts/new">
                        <Button>Write Your First Story</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.aboutCard}>
              <div className={styles.aboutSection}>
                <h3>Biography</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {user.bio || 'No biography provided.'}
                </p>
              </div>

              {Object.keys(socialLinks).length > 0 && (
                <div className={styles.aboutSection}>
                  <h3>Connect</h3>
                  <div className={styles.socialGrid}>
                    {socialLinks.twitter && (
                      <a
                        href={
                          socialLinks.twitter.startsWith('http')
                            ? socialLinks.twitter
                            : `https://twitter.com/${socialLinks.twitter.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialChip}
                      >
                        <TwitterIcon size={15} className="text-sky-400" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {socialLinks.github && (
                      <a
                        href={
                          socialLinks.github.startsWith('http')
                            ? socialLinks.github
                            : `https://github.com/${socialLinks.github}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialChip}
                      >
                        <GithubIcon size={15} />
                        <span>GitHub</span>
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={
                          socialLinks.linkedin.startsWith('http')
                            ? socialLinks.linkedin
                            : `https://linkedin.com/in/${socialLinks.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialChip}
                      >
                        <LinkedinIcon size={15} className="text-blue-400" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
