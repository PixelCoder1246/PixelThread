import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';

export interface AIGeneratePostInput {
  topic: string;
  targetAudience?: string;
  tone?: string;
  category?: string;
  keywords?: string[];
  approximateLength?: number;
}

export interface AIGeneratePostResponse {
  title: string;
  content: unknown;
  excerpt: string;
  tags: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AITitlesResponse {
  titles: string[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIExcerptResponse {
  excerpt: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AITagsResponse {
  tags: string[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISeoResponse {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIImproveResponse {
  content: unknown;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIRewriteResponse {
  content: unknown;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIExpandResponse {
  content: unknown;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIShortenResponse {
  content: unknown;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIContinueResponse {
  content: unknown;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISummarizeResponse {
  summary: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIFAQResponse {
  faqs: Array<{ question: string; answer: string }>;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISocialResponse {
  twitter: string;
  linkedin: string;
  facebook: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISuggestionsResponse {
  suggestions: Array<{ type: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIApplySuggestionsResponse {
  content: unknown;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIGeneratePostWithDataInput {
  content: string;
}

export interface AITitleInput {
  content: string;
  keywords?: string[];
}

export interface AIImproveTitleInput {
  currentTitle: string;
  targetKeyword?: string;
}

export interface AIExcerptInput {
  content: string;
}

export interface AITagsInput {
  content: string;
}

export interface AISeoInput {
  title: string;
  content: string;
}

export interface AIImproveInput {
  content: string;
}

export interface AIRewriteInput {
  content: string;
  tone?: string;
}

export interface AIExpandInput {
  content: string;
}

export interface AIShortenInput {
  content: string;
}

export interface AIContinueInput {
  content: string;
}

export interface AISummarizeInput {
  content: string;
}

export interface AIFAQInput {
  content: string;
}

export interface AISocialInput {
  content: string;
}

export interface AISuggestionsInput {
  content: string;
}

export interface AIApplySuggestionsInput {
  content: string;
  suggestions: Array<{ type: string; description: string; priority: 'high' | 'medium' | 'low' }>;
}

export const aiService = {
  async generatePost(data: AIGeneratePostInput): Promise<AIGeneratePostResponse> {
    return api.post(API_ENDPOINTS.ai.generatePost, data);
  },

  async generateTitles(data: AITitleInput): Promise<AITitlesResponse> {
    return api.post(API_ENDPOINTS.ai.generateTitles, data);
  },

  async improveTitle(data: AIImproveTitleInput): Promise<AITitlesResponse> {
    return api.post(API_ENDPOINTS.ai.improveTitle, data);
  },

  async generateExcerpt(data: AIExcerptInput): Promise<AIExcerptResponse> {
    return api.post(API_ENDPOINTS.ai.generateExcerpt, data);
  },

  async generateTags(data: AITagsInput): Promise<AITagsResponse> {
    return api.post(API_ENDPOINTS.ai.generateTags, data);
  },

  async generateSeo(data: AISeoInput): Promise<AISeoResponse> {
    return api.post(API_ENDPOINTS.ai.generateSeo, data);
  },

  async improveWriting(data: AIImproveInput): Promise<AIImproveResponse> {
    return api.post(API_ENDPOINTS.ai.improve, data);
  },

  async rewriteContent(data: AIRewriteInput): Promise<AIRewriteResponse> {
    return api.post(API_ENDPOINTS.ai.rewrite, data);
  },

  async expandContent(data: AIExpandInput): Promise<AIExpandResponse> {
    return api.post(API_ENDPOINTS.ai.expand, data);
  },

  async shortenContent(data: AIShortenInput): Promise<AIShortenResponse> {
    return api.post(API_ENDPOINTS.ai.shorten, data);
  },

  async continueWriting(data: AIContinueInput): Promise<AIContinueResponse> {
    return api.post(API_ENDPOINTS.ai.continue, data);
  },

  async summarizeContent(data: AISummarizeInput): Promise<AISummarizeResponse> {
    return api.post(API_ENDPOINTS.ai.summarize, data);
  },

  async generateFAQ(data: AIFAQInput): Promise<AIFAQResponse> {
    return api.post(API_ENDPOINTS.ai.generateFaq, data);
  },

  async generateSocialPosts(data: AISocialInput): Promise<AISocialResponse> {
    return api.post(API_ENDPOINTS.ai.generateSocial, data);
  },

  async generateSuggestions(data: AISuggestionsInput): Promise<AISuggestionsResponse> {
    return api.post(API_ENDPOINTS.ai.generateSuggestions, data);
  },

  async applySuggestions(data: AIApplySuggestionsInput): Promise<AIApplySuggestionsResponse> {
    return api.post(API_ENDPOINTS.ai.applySuggestions, data);
  },
};