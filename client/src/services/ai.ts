import axios from 'axios';
import { config } from '@/config';
import type { AiGenerationResponse, ApiResponse, AiPostFormData } from '@/types';

const aiApi = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 180000,
  withCredentials: config.api.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  failedQueue = [];
}

aiApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => aiApi(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${config.api.baseUrl}/auth/refresh`,
          {},
          { withCredentials: true, timeout: 10000 }
        );
        processQueue(null);
        return aiApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const aiService = {
  async generatePost(data: AiPostFormData): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/generate-post', data);
    return res.data.data;
  },

  async generateTitles(content: string, keywords?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/title', { content, keywords });
    return res.data.data;
  },

  async improveTitle(currentTitle: string, targetKeyword?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/title/improve', { currentTitle, targetKeyword });
    return res.data.data;
  },

  async generateExcerpt(content: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/excerpt', { content });
    return res.data.data;
  },

  async generateTags(content: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/tags', { content });
    return res.data.data;
  },

  async generateSeo(title: string, content: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/seo', { title, content });
    return res.data.data;
  },

  async improveWriting(content: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/improve', { content });
    return res.data.data;
  },

  async rewrite(content: string, tone?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/rewrite', { content, tone });
    return res.data.data;
  },

  async expand(content: string, context?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/expand', { content, context });
    return res.data.data;
  },

  async shorten(content: string, targetLength?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/shorten', { content, targetLength });
    return res.data.data;
  },

  async continueWriting(content: string, context?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/continue', { content, context });
    return res.data.data;
  },

  async summarize(content: string, maxLength?: number): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/summarize', { content, maxLength });
    return res.data.data;
  },

  async generateFaq(content: string, numQuestions?: number): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/faq', { content, numQuestions });
    return res.data.data;
  },

  async generateSocialPost(content: string, platform?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/social', { content, platform });
    return res.data.data;
  },

  async getSuggestions(content: string, context?: string): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/suggestions', { content, context });
    return res.data.data;
  },

  async applySuggestions(content: string, suggestions: string[]): Promise<AiGenerationResponse> {
    const res = await aiApi.post<ApiResponse<AiGenerationResponse>>('/ai/suggestions/apply', { content, suggestions });
    return res.data.data;
  },
};
