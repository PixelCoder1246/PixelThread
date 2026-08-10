import api from '@/lib/api';
import type { ApiResponse } from '@/types';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export const mediaService = {
  async getMyMedia(params?: { page?: number; limit?: number }): Promise<{ media: MediaItem[]; pagination: unknown }> {
    const res = await api.get('/me/media', { params });
    return res.data.data;
  },

  async upload(file: File, folder?: string): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const res = await api.post<ApiResponse<{ media: MediaItem }>>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.media;
  },

  async replace(mediaId: string, file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.patch<ApiResponse<{ media: MediaItem }>>(`/media/${mediaId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.media;
  },

  async delete(mediaId: string): Promise<void> {
    await api.delete(`/media/${mediaId}`);
  },
};

export type { MediaItem };
