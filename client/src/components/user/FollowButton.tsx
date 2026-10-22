'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useIsFollowing, useToggleFollow } from '@/features/follow/useFollow';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

interface FollowButtonProps {
  userId: string;
  userName?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function FollowButton({
  userId,
  userName = 'author',
  size = 'sm',
  className = '',
}: FollowButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const { isFollowing, isLoading: isChecking } = useIsFollowing(userId);
  const toggleFollow = useToggleFollow(userId);

  // Can't follow self
  if (user?.id === userId || !userId) {
    return null;
  }

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        message: `Please sign in to follow ${userName}.`,
        type: 'info',
      });
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    try {
      await toggleFollow.mutateAsync(isFollowing);
      toast({
        title: isFollowing ? `Unfollowed ${userName}` : `Following ${userName}`,
        message: isFollowing
          ? `You have unfollowed ${userName}.`
          : `You will now receive updates from ${userName}.`,
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Action failed',
        message:
          err instanceof Error
            ? err.message
            : 'Could not update follow status.',
        type: 'error',
      });
    }
  };

  const isPending = toggleFollow.isPending || isChecking;

  if (isFollowing) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`transition-all duration-200 border-slate-700 text-xs font-semibold ${
          isHovered
            ? 'hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
            : 'text-slate-300'
        } ${className}`}
      >
        {isPending ? (
          <Loader2 size={13} className="animate-spin mr-1.5" />
        ) : isHovered ? (
          <UserX size={13} className="mr-1.5 text-red-400" />
        ) : (
          <UserCheck size={13} className="mr-1.5 text-indigo-400" />
        )}
        <span>{isHovered ? 'Unfollow' : 'Following'}</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className={`border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500 text-xs font-semibold transition-all duration-200 ${className}`}
    >
      {isPending ? (
        <Loader2 size={13} className="animate-spin mr-1.5" />
      ) : (
        <UserPlus size={13} className="mr-1.5" />
      )}
      <span>Follow</span>
    </Button>
  );
}
