import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminService,
  type AdminFilters,
  type PlatformSettings,
} from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';

export const ADMIN_QUERY_KEYS = {
  dashboard: ['admin', 'dashboard'],
  users: (filters?: AdminFilters) => ['admin', 'users', filters],
  user: (id: string) => ['admin', 'users', id],
  posts: (filters?: AdminFilters) => ['admin', 'posts', filters],
  comments: (filters?: AdminFilters) => ['admin', 'comments', filters],
  media: (filters?: AdminFilters) => ['admin', 'media', filters],
  orphanedMedia: ['admin', 'media', 'orphaned'],
  announcements: ['admin', 'announcements'],
  auditLogs: (filters?: AdminFilters) => ['admin', 'audit-logs', filters],
  settings: ['admin', 'settings'],
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard,
    queryFn: () => adminService.getDashboard(),
    staleTime: 30000,
  });
}

export function useAdminUsers(filters?: AdminFilters) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users(filters),
    queryFn: () => adminService.getUsers(filters),
    staleTime: 30000,
  });
}

export function useAdminPosts(filters?: AdminFilters) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.posts(filters),
    queryFn: () => adminService.getPosts(filters),
    staleTime: 30000,
  });
}

export function useAdminComments(filters?: AdminFilters) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.comments(filters),
    queryFn: () => adminService.getComments(filters),
    staleTime: 30000,
  });
}

export function useAdminMedia(filters?: AdminFilters) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.media(filters),
    queryFn: () => adminService.getMediaList(filters),
    staleTime: 30000,
  });
}

export function useAdminOrphanedMedia() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.orphanedMedia,
    queryFn: () => adminService.getOrphanedMedia(),
  });
}

export function useAdminAnnouncements() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.announcements,
    queryFn: () => adminService.getAnnouncements(),
  });
}

export function useAdminAuditLogs(filters?: AdminFilters) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.auditLogs(filters),
    queryFn: () => adminService.getAuditLogs(filters),
    staleTime: 30000,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.settings,
    queryFn: () => adminService.getSettings(),
  });
}

// ================= Mutations =================

export function useAdminMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserRole = useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    }) => adminService.updateUserRole(id, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Role updated',
        message: `User ${data.username || data.email} is now ${data.role}.`,
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Update failed',
        message: err.message,
        type: 'error',
      });
    },
  });

  const banUser = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      toast({
        title: 'User banned',
        message: 'The user account has been suspended.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Ban action failed',
        message: err.message,
        type: 'error',
      });
    },
  });

  const unbanUser = useMutation({
    mutationFn: (id: string) => adminService.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      toast({
        title: 'User unbanned',
        message: 'The user account has been restored.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Unban action failed',
        message: err.message,
        type: 'error',
      });
    },
  });

  const verifyUser = useMutation({
    mutationFn: (id: string) => adminService.verifyUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      toast({
        title: 'User verified',
        message: 'User email verified successfully.',
        type: 'success',
      });
    },
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => adminService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      toast({
        title: 'Post deleted',
        message: 'The post has been removed.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Delete failed',
        message: err.message,
        type: 'error',
      });
    },
  });

  const toggleFeaturePost = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      isFeatured
        ? adminService.unfeaturePost(id)
        : adminService.featurePost(id),
    onSuccess: (_, { isFeatured }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      toast({
        title: isFeatured ? 'Post unfeatured' : 'Post featured',
        message: isFeatured
          ? 'Post removed from featured list.'
          : 'Post highlighted on feed.',
        type: 'success',
      });
    },
  });

  const togglePinPost = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      isPinned ? adminService.unpinPost(id) : adminService.pinPost(id),
    onSuccess: (_, { isPinned }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      toast({
        title: isPinned ? 'Post unpinned' : 'Post pinned',
        message: isPinned
          ? 'Post unpinned from top of list.'
          : 'Post pinned to top of list.',
        type: 'success',
      });
    },
  });

  const toggleArchivePost = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      isArchived ? adminService.restorePost(id) : adminService.archivePost(id),
    onSuccess: (_, { isArchived }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      toast({
        title: isArchived ? 'Post restored' : 'Post archived',
        message: isArchived
          ? 'Post restored to published status.'
          : 'Post moved to archived status.',
        type: 'success',
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: (id: string) => adminService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard });
      toast({
        title: 'Comment deleted',
        message: 'The comment has been removed.',
        type: 'success',
      });
    },
  });

  const toggleHideComment = useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      isHidden ? adminService.approveComment(id) : adminService.hideComment(id),
    onSuccess: (_, { isHidden }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      toast({
        title: isHidden ? 'Comment approved' : 'Comment hidden',
        message: isHidden
          ? 'Comment is now visible to everyone.'
          : 'Comment hidden from public view.',
        type: 'success',
      });
    },
  });

  const deleteMedia = useMutation({
    mutationFn: (id: string) => adminService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
      toast({
        title: 'Media deleted',
        message: 'File removed from server storage.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Delete failed',
        message: err.message || 'Could not delete media file.',
        type: 'error',
      });
    },
  });

  const cleanOrphanedMedia = useMutation({
    mutationFn: async (limit: number = 50) => {
      // Backend Express route registration defines router.delete('/media/:id') before
      // router.delete('/media/orphaned'), which causes DELETE /media/orphaned to be captured
      // as deleteMedia('orphaned') -> 404 Media not found.
      // To reliably clean orphaned media without backend changes, we retrieve the orphaned list
      // and delete each unreferenced item using the valid deleteMedia(id) route.
      const orphaned = await adminService.getOrphanedMedia();
      if (!orphaned || orphaned.length === 0) {
        return { deleted: 0, remaining: 0 };
      }

      const toDelete = orphaned.slice(0, limit);
      const results = await Promise.allSettled(
        toDelete.map((item) => adminService.deleteMedia(item.id))
      );

      const deletedCount = results.filter(
        (r) => r.status === 'fulfilled'
      ).length;
      return {
        deleted: deletedCount,
        remaining: Math.max(0, orphaned.length - deletedCount),
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
      toast({
        title: 'Cleanup complete',
        message: `Deleted ${data.deleted} orphaned files (${data.remaining} remaining).`,
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Cleanup failed',
        message: err.message || 'Could not clean up unreferenced media files.',
        type: 'error',
      });
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: (data: {
      title: string;
      content?: string;
      message?: string;
      type?: string;
      expiresAt?: string;
    }) => adminService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.announcements,
      });
      toast({
        title: 'Announcement published',
        message: 'Broadcast is now live for all users.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Announcement failed',
        message: err.message || 'Could not publish announcement.',
        type: 'error',
      });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: (id: string) => adminService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.announcements,
      });
      toast({
        title: 'Announcement deleted',
        message: 'The broadcast was removed.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Deletion failed',
        message: err.message || 'Could not delete announcement.',
        type: 'error',
      });
    },
  });

  const updateSettings = useMutation({
    mutationFn: (settings: PlatformSettings) =>
      adminService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.settings });
      toast({
        title: 'Settings saved',
        message: 'Platform configuration updated successfully.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Settings failed',
        message: err.message || 'Could not update platform configuration.',
        type: 'error',
      });
    },
  });

  return {
    updateUserRole,
    banUser,
    unbanUser,
    verifyUser,
    deletePost,
    toggleFeaturePost,
    togglePinPost,
    toggleArchivePost,
    deleteComment,
    toggleHideComment,
    deleteMedia,
    cleanOrphanedMedia,
    createAnnouncement,
    deleteAnnouncement,
    updateSettings,
  };
}
