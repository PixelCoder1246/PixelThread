'use client';

import Link from 'next/link';
import { Heart, X } from 'lucide-react';
import { usePostLikes } from '@/features/likes/useLike';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';

interface LikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LikesModal({ postId, isOpen, onClose }: LikesModalProps) {
  const { data, isLoading } = usePostLikes(postId, 1, 50);

  if (!isOpen) return null;

  const users = data?.users ?? [];
  const totalCount = data?.likeCount ?? users.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <h3 className="font-bold text-lg text-slate-100">
              Liked by {totalCount > 0 ? `(${totalCount})` : ''}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 max-h-[60vh] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">
              No likes yet. Be the first to appreciate this story!
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                <Link
                  href={`/users/${u.name}`}
                  onClick={onClose}
                  className="flex items-center gap-3 group"
                >
                  <Avatar
                    src={u.image || undefined}
                    fallback={(u.name || 'U').charAt(0).toUpperCase()}
                    size="md"
                  />
                  <div>
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors block">
                      {u.name}
                    </span>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
