import { api, API_ENDPOINTS, type ApiClient } from '@/lib/api';

const typedApi = api as ApiClient;

export interface UploadMediaResponse {
  id?: string;
  url: string;
  key?: string;
}

export const mediaService = {
  async upload(file: File, altText?: string): Promise<UploadMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('altText', altText);
    }
    return typedApi.postForm<UploadMediaResponse>(
      API_ENDPOINTS.media.upload,
      formData
    );
  },
};
