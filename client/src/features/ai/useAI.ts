import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  aiService,
  AIGeneratePostInput,
  AITitleInput,
  AIImproveTitleInput,
  AIExcerptInput,
  AITagsInput,
  AISeoInput,
  AIImproveInput,
  AIRewriteInput,
  AIExpandInput,
  AIShortenInput,
  AIContinueInput,
  AISummarizeInput,
  AIFAQInput,
  AISocialInput,
  AISuggestionsInput,
  AIApplySuggestionsInput,
} from '@/services/ai.service';

export interface AIHistoryItem {
  id: string;
  type: string;
  title: string;
  preview: string;
  data: unknown;
  createdAt: string;
  tokensUsed?: number;
}

const AI_HISTORY_STORAGE_KEY = 'pixelthread_ai_history';

export function useAIHistory() {
  const [history, setHistory] = useState<AIHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = sessionStorage.getItem(AI_HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = useCallback((items: AIHistoryItem[]) => {
    setHistory(items);
    try {
      sessionStorage.setItem(AI_HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota or disabled
    }
  }, []);

  const addHistoryItem = useCallback(
    (item: Omit<AIHistoryItem, 'id' | 'createdAt'>) => {
      const newItem: AIHistoryItem = {
        ...item,
        id:
          'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => {
        const updated = [newItem, ...prev.slice(0, 19)]; // Keep latest 20
        try {
          sessionStorage.setItem(
            AI_HISTORY_STORAGE_KEY,
            JSON.stringify(updated)
          );
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        sessionStorage.setItem(AI_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return {
    history,
    addHistoryItem,
    clearHistory,
    removeHistoryItem,
  };
}

import { useToast } from '@/components/ui/Toast';

export function useAI() {
  const { addHistoryItem } = useAIHistory();
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      const message = error instanceof Error ? error.message : fallbackMessage;
      toast({
        title: 'AI Generation Notice',
        message,
        type: 'error',
      });
    },
    [toast]
  );

  // 1. Generate Full Blog Post
  const generatePost = useMutation({
    mutationFn: (data: AIGeneratePostInput) => aiService.generatePost(data),
    onSuccess: (res, vars) => {
      addHistoryItem({
        type: 'generate-post',
        title: `Full Post: ${vars.topic}`,
        preview:
          res.title ||
          (typeof res.content === 'string'
            ? res.content.substring(0, 80)
            : 'Full Post Generated'),
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
      toast({
        title: 'Article Generated!',
        message: `Successfully drafted "${res.title || vars.topic}"`,
        type: 'success',
      });
    },
    onError: (err) =>
      handleError(err, 'Failed to generate post. Please check parameters.'),
  });

  // 2. Title Suggestions
  const generateTitles = useMutation({
    mutationFn: (data: AITitleInput) => aiService.generateTitles(data),
    onSuccess: (res) => {
      const first = res.titles?.[0];
      const previewTitle =
        typeof first === 'string' ? first : first?.title || 'Generated titles';
      addHistoryItem({
        type: 'titles',
        title: 'Title Ideas',
        preview: previewTitle,
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to generate titles.'),
  });

  // 3. Improve Title
  const improveTitle = useMutation({
    mutationFn: (data: AIImproveTitleInput) => aiService.improveTitle(data),
    onSuccess: (res, vars) => {
      addHistoryItem({
        type: 'improve-title',
        title: `Improved: ${vars.currentTitle.substring(0, 30)}...`,
        preview: res.improvedTitle || 'Improved headline',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to improve headline.'),
  });

  // 4. Generate Excerpt
  const generateExcerpt = useMutation({
    mutationFn: (data: AIExcerptInput) => aiService.generateExcerpt(data),
    onSuccess: (res) => {
      addHistoryItem({
        type: 'excerpt',
        title: 'Story Excerpt',
        preview: res.excerpt,
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to generate excerpt.'),
  });

  // 5. Generate Tags
  const generateTags = useMutation({
    mutationFn: (data: AITagsInput) => aiService.generateTags(data),
    onSuccess: (res) => {
      addHistoryItem({
        type: 'tags',
        title: 'Topic Tags',
        preview: res.tags?.map((t) => `#${t}`).join(', ') || 'Tags generated',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to generate tags.'),
  });

  // 6. Generate SEO
  const generateSeo = useMutation({
    mutationFn: (data: AISeoInput) => aiService.generateSeo(data),
    onSuccess: (res) => {
      addHistoryItem({
        type: 'seo',
        title: 'SEO Metadata',
        preview:
          res.seoTitle ||
          res.metaTitle ||
          res.metaDescription ||
          'SEO metadata',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to generate SEO metadata.'),
  });

  // 7. Improve Writing
  const improveWriting = useMutation({
    mutationFn: (data: AIImproveInput) => aiService.improveWriting(data),
    onSuccess: (res) => {
      const contentStr = res.improvedContent || res.content || '';
      addHistoryItem({
        type: 'improve',
        title: 'Improved Content',
        preview: contentStr ? contentStr.substring(0, 100) : 'Content improved',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to improve writing.'),
  });

  // 8. Rewrite with Tone
  const rewriteContent = useMutation({
    mutationFn: (data: AIRewriteInput) => aiService.rewriteContent(data),
    onSuccess: (res, vars) => {
      const contentStr = res.rewrittenContent || res.content || '';
      addHistoryItem({
        type: 'rewrite',
        title: `Rewrite (${vars.tone || 'custom'})`,
        preview: contentStr
          ? contentStr.substring(0, 100)
          : 'Content rewritten',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to rewrite content.'),
  });

  // 9. Expand Content
  const expandContent = useMutation({
    mutationFn: (data: AIExpandInput) => aiService.expandContent(data),
    onSuccess: (res) => {
      const contentStr = res.expandedContent || res.content || '';
      addHistoryItem({
        type: 'expand',
        title: 'Expanded Section',
        preview: contentStr ? contentStr.substring(0, 100) : 'Content expanded',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to expand content.'),
  });

  // 10. Shorten Content
  const shortenContent = useMutation({
    mutationFn: (data: AIShortenInput) => aiService.shortenContent(data),
    onSuccess: (res) => {
      const contentStr = res.shortenedContent || res.content || '';
      addHistoryItem({
        type: 'shorten',
        title: 'Shortened Content',
        preview: contentStr
          ? contentStr.substring(0, 100)
          : 'Content shortened',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to shorten content.'),
  });

  // 11. Continue Writing
  const continueWriting = useMutation({
    mutationFn: (data: AIContinueInput) => aiService.continueWriting(data),
    onSuccess: (res) => {
      const contentStr = res.continuation || res.content || '';
      addHistoryItem({
        type: 'continue',
        title: 'Story Continuation',
        preview: contentStr
          ? contentStr.substring(0, 100)
          : 'Continuation generated',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to continue writing.'),
  });

  // 12. Summarize Content
  const summarizeContent = useMutation({
    mutationFn: (data: AISummarizeInput) => aiService.summarizeContent(data),
    onSuccess: (res) => {
      const summaryStr =
        res.paragraphSummary || res.oneLineSummary || res.summary || '';
      addHistoryItem({
        type: 'summarize',
        title: 'Summary',
        preview: summaryStr
          ? summaryStr.substring(0, 100)
          : 'Summary generated',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to summarize content.'),
  });

  // 13. Generate FAQ
  const generateFAQ = useMutation({
    mutationFn: (data: AIFAQInput) => aiService.generateFAQ(data),
    onSuccess: (res) => {
      addHistoryItem({
        type: 'faq',
        title: 'FAQ Section',
        preview: `${res.faqs?.length || 0} Questions & Answers`,
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to generate FAQs.'),
  });

  // 14. Generate Social Posts
  const generateSocialPosts = useMutation({
    mutationFn: (data: AISocialInput) => aiService.generateSocialPosts(data),
    onSuccess: (res) => {
      const twText =
        typeof res.twitter === 'object' ? res.twitter?.post : res.twitter;
      const liText =
        typeof res.linkedin === 'object' ? res.linkedin?.post : res.linkedin;
      addHistoryItem({
        type: 'social',
        title: 'Social Posts',
        preview: (twText || liText || 'Social content generated').substring(
          0,
          80
        ),
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to generate social posts.'),
  });

  // 15. Generate Critique & Suggestions
  const generateSuggestions = useMutation({
    mutationFn: (data: AISuggestionsInput) =>
      aiService.generateSuggestions(data),
    onSuccess: (res) => {
      addHistoryItem({
        type: 'suggestions',
        title: 'Writing Critique & Suggestions',
        preview: `${res.suggestions?.length || 0} recommendations provided`,
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to audit draft.'),
  });

  // 16. Apply Suggestions
  const applySuggestions = useMutation({
    mutationFn: (data: AIApplySuggestionsInput) =>
      aiService.applySuggestions(data),
    onSuccess: (res) => {
      const contentStr = res.improvedContent || res.content || '';
      addHistoryItem({
        type: 'apply-suggestions',
        title: 'Optimized Content',
        preview: contentStr
          ? contentStr.substring(0, 100)
          : 'Suggestions applied to story',
        data: res,
        tokensUsed: res.tokenUsage?.totalTokens,
      });
    },
    onError: (err) => handleError(err, 'Failed to apply suggestions.'),
  });

  const isAnyLoading =
    generatePost.isPending ||
    generateTitles.isPending ||
    improveTitle.isPending ||
    generateExcerpt.isPending ||
    generateTags.isPending ||
    generateSeo.isPending ||
    improveWriting.isPending ||
    rewriteContent.isPending ||
    expandContent.isPending ||
    shortenContent.isPending ||
    continueWriting.isPending ||
    summarizeContent.isPending ||
    generateFAQ.isPending ||
    generateSocialPosts.isPending ||
    generateSuggestions.isPending ||
    applySuggestions.isPending;

  return {
    generatePost,
    generateTitles,
    improveTitle,
    generateExcerpt,
    generateTags,
    generateSeo,
    improveWriting,
    rewriteContent,
    expandContent,
    shortenContent,
    continueWriting,
    summarizeContent,
    generateFAQ,
    generateSocialPosts,
    generateSuggestions,
    applySuggestions,
    isAnyLoading,
  };
}
