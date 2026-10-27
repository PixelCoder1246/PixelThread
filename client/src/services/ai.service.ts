import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';

export interface AIGeneratePostInput {
  topic: string;
  targetAudience?: string;
  tone?: string;
  category?: string;
  keywords?: string[] | string;
  approximateLength?: 'short' | 'medium' | 'long' | 'comprehensive';
}

export interface AIGeneratePostResponse {
  title: string;
  content: string;
  excerpt: string;
  suggestedTags: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  tokenUsage: {
    model?: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    responseTime?: string;
    finishReason?: string;
  };
}

export interface AITitleItem {
  title: string;
  confidenceScore: number;
  seoScore: number;
  clickabilityScore: number;
}

export interface AITitlesResponse {
  titles: (string | AITitleItem)[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIImproveTitleResponse {
  improvedTitle: string;
  explanation: string;
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
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalSlug?: string;
  recommendations?: string[];
  metaTitle?: string;
  keywords?: string[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIImproveResponse {
  improvedContent: string;
  changes?: string[];
  content?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIRewriteResponse {
  rewrittenContent: string;
  tone?: string;
  content?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIExpandResponse {
  expandedContent: string;
  expansionNotes?: string[];
  content?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIShortenResponse {
  shortenedContent: string;
  originalWordCount?: number;
  newWordCount?: number;
  content?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIContinueResponse {
  continuation: string;
  transitionNotes?: string;
  content?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISummarizeResponse {
  oneLineSummary?: string;
  paragraphSummary?: string;
  bulletPoints?: string[];
  summary?: string;
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

export interface AISocialPlatformPost {
  post: string;
  hashtags?: string[];
}

export interface AISocialResponse {
  twitter: string | AISocialPlatformPost;
  linkedin: string | AISocialPlatformPost;
  facebook?: string | AISocialPlatformPost;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISuggestionItem {
  type: string;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
  location?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface AISuggestionsResponse {
  suggestions: AISuggestionItem[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIApplySuggestionsResponse {
  improvedContent: string;
  changesApplied?: string[];
  content?: string;
  originalWordCount?: number;
  newWordCount?: number;
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
  keywords?: string[] | string;
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
  tone: string;
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
  suggestions?: Array<{
    type?: string;
    suggestion?: string;
    description?: string;
    severity?: 'high' | 'medium' | 'low';
    priority?: 'high' | 'medium' | 'low';
  }>;
}

export const aiService = {
  async generatePost(
    data: AIGeneratePostInput
  ): Promise<AIGeneratePostResponse> {
    return api.post(API_ENDPOINTS.ai.generatePost, data);
  },

  async generateTitles(data: AITitleInput): Promise<AITitlesResponse> {
    return api.post(API_ENDPOINTS.ai.generateTitles, data);
  },

  async improveTitle(
    data: AIImproveTitleInput
  ): Promise<AIImproveTitleResponse> {
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

  async generateSuggestions(
    data: AISuggestionsInput
  ): Promise<AISuggestionsResponse> {
    return api.post(API_ENDPOINTS.ai.generateSuggestions, data);
  },

  async applySuggestions(
    data: AIApplySuggestionsInput
  ): Promise<AIApplySuggestionsResponse> {
    return api.post(API_ENDPOINTS.ai.applySuggestions, data);
  },
};
