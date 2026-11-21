const OpenAI = require('openai');
const prisma = require('../../config/db');
const { AI_DEFAULT_CONFIG, AI_GENERATION_TYPES } = require('./ai.constants');
const { SYSTEM_PROMPTS, USER_PROMPT_BUILDERS } = require('./ai.prompts');
const {
  extractJSON,
  buildTokenUsage,
  parseAIResponse,
  stripReasoning,
  formatToRichHTML,
  cleanPlainText,
} = require('./ai.utils');
const aiCache = require('./ai.cache');
const {
  generatePostFallback,
  generateTitlesFallback,
  generateExcerptFallback,
  generateTagsFallback,
  generateSeoFallback,
  generateFAQFallback,
  generateSocialFallback,
  continueWritingFallback,
  improveWritingFallback,
  rewriteContentFallback,
  expandContentFallback,
  shortenContentFallback,
  summarizeContentFallback,
} = require('./ai.fallbacks');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

let aiClient = null;

const FALLBACK_MODELS = [
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'nvidia/nemotron-3.5-bolt-e4b',
  'minimaxai/minimax-m3.1-flash',
  'z-ai/glm-5.3-flash',
];

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.NVIDIA_API_KEY;
    const baseURL =
      process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';

    if (!apiKey) {
      throw new ApiError(
        503,
        'AI service not configured. Please set NVIDIA_API_KEY environment variable on your server.'
      );
    }

    aiClient = new OpenAI({
      apiKey,
      baseURL,
      timeout: 25000,
      maxRetries: 1,
    });
  }
  return aiClient;
};

const generateAIResponse = async ({
  systemPrompt,
  userPrompt,
  temperature = AI_DEFAULT_CONFIG.temperature,
  top_p = AI_DEFAULT_CONFIG.top_p,
  maxTokens = AI_DEFAULT_CONFIG.maxTokens,
  stream = false,
  model = AI_DEFAULT_CONFIG.model,
}) => {
  const client = getAIClient();
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const modelsToTry = Array.from(
    new Set(
      [
        model,
        process.env.AI_MODEL,
        process.env.NVIDIA_MODEL,
        ...FALLBACK_MODELS,
      ].filter(Boolean)
    )
  );

  let lastError = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const requestOptions = {
      model: currentModel,
      messages,
      temperature,
      top_p,
      max_tokens: maxTokens,
      stream,
    };

    try {
      if (stream) {
        const streamResponse = await client.chat.completions.create({
          ...requestOptions,
          stream: true,
        });
        return streamResponse;
      }

      const response = await client.chat.completions.create(requestOptions);
      const tokenUsage = buildTokenUsage(response, currentModel, Date.now());
      const content = parseAIResponse(response);
      return { content, tokenUsage };
    } catch (err) {
      lastError = err;
      logger.warn('AI model call failed', {
        model: currentModel,
        status: err.status,
        code: err.code,
        message: err.message,
      });

      if (
        err.status === 401 ||
        err.status === 403 ||
        err.message?.includes('not configured')
      ) {
        break;
      }

      if (i < modelsToTry.length - 1) {
        logger.info(
          `Failing over from ${currentModel} to next model: ${modelsToTry[i + 1]}`
        );
        continue;
      }

      break;
    }
  }

  const err = lastError;
  if (!err) {
    throw new ApiError(500, 'Unknown AI generation failure.');
  }

  if (err instanceof ApiError) {
    throw err;
  }
  if (err.status === 403 || err.status === 401) {
    throw new ApiError(
      503,
      'AI provider authentication failed. Check API key configuration.'
    );
  }
  if (err.status === 429) {
    throw new ApiError(
      429,
      'AI provider rate limit exceeded. Please try again in a moment.'
    );
  }
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    throw new ApiError(504, 'AI request timed out. Please try again.');
  }
  if (
    err.code === 'ECONNRESET' ||
    err.code === 'ENOTFOUND' ||
    err.name === 'APIConnectionError' ||
    err.message?.includes('Connection error')
  ) {
    throw new ApiError(
      503,
      'AI service connection error. Please try again shortly.'
    );
  }

  const statusCode =
    typeof err.status === 'number' && err.status >= 400 && err.status < 500
      ? err.status
      : 503;
  throw new ApiError(
    statusCode,
    err.message || 'AI service temporarily unavailable. Please try again.'
  );
};

const logAIGeneration = async ({ userId, postId, type, prompt, response }) => {
  if (!userId) return;
  try {
    await prisma.aIGeneration.create({
      data: {
        userId,
        postId,
        type,
        prompt: prompt.substring(0, 1000),
        response:
          typeof response === 'string'
            ? response.substring(0, 10000)
            : JSON.stringify(response).substring(0, 10000),
      },
    });
  } catch (error) {
    logger.error('Failed to log AI generation', { error: error.message });
  }
};

const generatePost = async (
  { topic, targetAudience, tone, category, keywords, approximateLength },
  userId
) => {
  const cacheKey = aiCache.generateKey('generatePost', {
    topic,
    targetAudience,
    tone,
    category,
    keywords,
    approximateLength,
  });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = generatePostFallback({ topic, keywords });
  try {
    const systemPrompt = SYSTEM_PROMPTS.generatePost;
    const userPrompt = USER_PROMPT_BUILDERS.generatePost({
      topic,
      targetAudience,
      tone,
      category,
      keywords,
      approximateLength,
    });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.BLOG,
      prompt: userPrompt,
      response: result.content,
    });

    if (parsed && (parsed.content || parsed.title)) {
      const responseData = {
        title: cleanPlainText(parsed.title) || fallback.title,
        excerpt: cleanPlainText(parsed.excerpt) || fallback.excerpt,
        content:
          formatToRichHTML(stripReasoning(parsed.content)) || fallback.content,
        tags:
          Array.isArray(parsed.tags) && parsed.tags.length > 0
            ? parsed.tags.map(cleanPlainText).filter(Boolean)
            : Array.isArray(parsed.suggestedTags) &&
                parsed.suggestedTags.length > 0
              ? parsed.suggestedTags.map(cleanPlainText).filter(Boolean)
              : fallback.tags,
        tokenUsage: result.tokenUsage,
      };
      aiCache.set(cacheKey, responseData);
      return responseData;
    }
    aiCache.set(cacheKey, fallback);
    return fallback;
  } catch (error) {
    logger.warn('AI generatePost failed, returning structured fallback draft', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const generateTitles = async ({ content, keywords }, userId) => {
  const cacheKey = aiCache.generateKey('generateTitles', { content, keywords });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = generateTitlesFallback({ content, keywords });
  const fallbackTitles = fallback.titles;

  try {
    const systemPrompt = SYSTEM_PROMPTS.title;
    const userPrompt = USER_PROMPT_BUILDERS.title({ content, keywords });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 1024,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.TITLE,
      prompt: userPrompt,
      response: result.content,
    });

    let rawList = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (Array.isArray(parsed?.titles)) {
      rawList = parsed.titles;
    }

    const cleanList = rawList
      .map((item) => {
        if (typeof item === 'string') return cleanPlainText(item);
        if (typeof item === 'object' && item !== null) {
          return cleanPlainText(item.title || item.text || item.headline || '');
        }
        return '';
      })
      .filter(Boolean);

    const titles = cleanList.length > 0 ? cleanList : fallbackTitles;

    const responseData = {
      title: titles[0] || fallbackTitles[0],
      titles,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI generateTitles failed, returning fallback titles', {
      error: error.message,
    });
    const fallbackRes = {
      title: fallbackTitles[0],
      titles: fallbackTitles,
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

const improveTitle = async ({ currentTitle, targetKeyword }, userId) => {
  const safeCurrent =
    cleanPlainText(currentTitle) || 'Modern Web Development Guide';
  const cacheKey = aiCache.generateKey('improveTitle', {
    currentTitle: safeCurrent,
    targetKeyword,
  });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const systemPrompt = SYSTEM_PROMPTS.improveTitle;
    const userPrompt = USER_PROMPT_BUILDERS.improveTitle({
      currentTitle: safeCurrent,
      targetKeyword,
    });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 1024,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.TITLE,
      prompt: userPrompt,
      response: result.content,
    });

    const responseData = {
      ...parsed,
      improvedTitle:
        cleanPlainText(parsed?.improvedTitle) ||
        `The Ultimate Guide to ${safeCurrent}`,
      originalTitle: cleanPlainText(parsed?.originalTitle || safeCurrent),
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI improveTitle failed, returning fallback title', {
      error: error.message,
    });
    const fallbackRes = {
      improvedTitle: `Mastering ${safeCurrent}: Key Insights & Practical Strategies`,
      originalTitle: safeCurrent,
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

const generateExcerpt = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('generateExcerpt', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallbackResult = generateExcerptFallback({ content });
  const fallback = fallbackResult.excerpt;
  try {
    const systemPrompt = SYSTEM_PROMPTS.excerpt;
    const userPrompt = USER_PROMPT_BUILDERS.excerpt({
      content: content || fallback,
    });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1024,
    });

    const excerpt = cleanPlainText(result.content) || fallback;
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.EXCERPT,
      prompt: userPrompt,
      response: excerpt,
    });

    const responseData = {
      excerpt,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI excerpt generation failed, using fallback excerpt', {
      error: error.message,
    });
    const fallbackRes = {
      excerpt: fallback,
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

const generateTags = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('generateTags', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = generateTagsFallback({ content });
  const fallbackTags = fallback.tags;

  try {
    const systemPrompt = SYSTEM_PROMPTS.tags;
    const userPrompt = USER_PROMPT_BUILDERS.tags({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 512,
    });

    const parsed = extractJSON(result.content);
    const tags =
      Array.isArray(parsed) && parsed.length > 0
        ? [
            ...new Set(
              parsed.map((t) => cleanPlainText(t).toLowerCase()).filter(Boolean)
            ),
          ].slice(0, 10)
        : fallbackTags;

    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.TAGS,
      prompt: userPrompt,
      response: result.content,
    });

    const responseData = {
      tags,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI generateTags failed, returning fallback tags', {
      error: error.message,
    });
    const fallbackRes = {
      tags: fallbackTags,
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

const generateSEO = async ({ title, content }, userId) => {
  const cacheKey = aiCache.generateKey('generateSEO', { title, content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallbackSeo = generateSeoFallback({ title, content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.seo;
    const userPrompt = USER_PROMPT_BUILDERS.seo({ title, content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 1024,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.SEO,
      prompt: userPrompt,
      response: result.content,
    });

    const responseData = {
      ...fallbackSeo,
      ...parsed,
      metaTitle: cleanPlainText(parsed?.metaTitle || fallbackSeo.metaTitle),
      metaDescription: cleanPlainText(
        parsed?.metaDescription || fallbackSeo.metaDescription
      ),
      ogTitle: cleanPlainText(parsed?.ogTitle || fallbackSeo.ogTitle),
      ogDescription: cleanPlainText(
        parsed?.ogDescription || fallbackSeo.ogDescription
      ),
      keywords:
        Array.isArray(parsed?.keywords) && parsed.keywords.length > 0
          ? parsed.keywords.map(cleanPlainText).filter(Boolean)
          : fallbackSeo.keywords,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI generateSEO failed, returning fallback SEO metadata', {
      error: error.message,
    });
    const fallbackRes = {
      ...fallbackSeo,
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

const improveWriting = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('improveWriting', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = improveWritingFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.improve;
    const userPrompt = USER_PROMPT_BUILDERS.improve({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.IMPROVE,
      prompt: userPrompt,
      response: result.content,
    });

    const improvedContent = formatToRichHTML(
      stripReasoning(parsed?.improvedContent || result.content)
    );

    const responseData = {
      ...parsed,
      improvedContent: improvedContent || fallback.improvedContent,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI improveWriting failed, returning fallback content', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const rewriteContent = async ({ content, tone }, userId) => {
  const cacheKey = aiCache.generateKey('rewriteContent', { content, tone });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = rewriteContentFallback({ content, tone });

  try {
    const systemPrompt = SYSTEM_PROMPTS.rewrite;
    const userPrompt = USER_PROMPT_BUILDERS.rewrite({ content, tone });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.REWRITE,
      prompt: userPrompt,
      response: result.content,
    });

    const rewrittenContent = formatToRichHTML(
      stripReasoning(parsed?.rewrittenContent || result.content)
    );

    const responseData = {
      ...parsed,
      rewrittenContent: rewrittenContent || fallback.rewrittenContent,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI rewriteContent failed, returning fallback content', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const expandContent = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('expandContent', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = expandContentFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.expand;
    const userPrompt = USER_PROMPT_BUILDERS.expand({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.EXPAND,
      prompt: userPrompt,
      response: result.content,
    });

    const expandedContent = formatToRichHTML(
      stripReasoning(parsed?.expandedContent || result.content)
    );

    const responseData = {
      ...parsed,
      expandedContent: expandedContent || fallback.expandedContent,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI expandContent failed, returning fallback content', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const shortenContent = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('shortenContent', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = shortenContentFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.shorten;
    const userPrompt = USER_PROMPT_BUILDERS.shorten({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.SHORTEN,
      prompt: userPrompt,
      response: result.content,
    });

    const shortenedContent = formatToRichHTML(
      stripReasoning(parsed?.shortenedContent || result.content)
    );

    const responseData = {
      ...parsed,
      shortenedContent: shortenedContent || fallback.shortenedContent,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI shortenContent failed, returning fallback content', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const continueWriting = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('continueWriting', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = continueWritingFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.continue;
    const userPrompt = USER_PROMPT_BUILDERS.continue({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.CONTINUE,
      prompt: userPrompt,
      response: result.content,
    });

    const continuation = formatToRichHTML(
      stripReasoning(parsed?.continuation || result.content)
    );

    const responseData = {
      ...parsed,
      continuation: continuation || fallback.continuation,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI continueWriting failed, returning fallback continuation', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const summarizeContent = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('summarizeContent', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = summarizeContentFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.summarize;
    const userPrompt = USER_PROMPT_BUILDERS.summarize({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.SUMMARIZE,
      prompt: userPrompt,
      response: result.content,
    });

    const formattedSummary = formatToRichHTML(
      stripReasoning(parsed?.summary || parsed?.content || result.content)
    );
    const formattedContent = formatToRichHTML(
      stripReasoning(parsed?.content || parsed?.summary || result.content)
    );

    const responseData = {
      ...parsed,
      summary: formattedSummary || fallback.summary,
      content: formattedContent || fallback.content,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI summarizeContent failed, returning fallback summary', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const generateFAQ = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('generateFAQ', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallback = generateFAQFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.faq;
    const userPrompt = USER_PROMPT_BUILDERS.faq({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.FAQ,
      prompt: userPrompt,
      response: result.content,
    });

    const faqs =
      Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback.faqs;

    const responseData = {
      faqs,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI generateFAQ failed, returning fallback FAQ', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallback);
    return fallback;
  }
};

const formatSocialPlatformPost = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object') {
    const postText = item.post || item.content || item.text || '';
    const hashtags = Array.isArray(item.hashtags)
      ? item.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      : '';
    return [postText, hashtags].filter(Boolean).join('\n\n').trim();
  }
  return '';
};

const generateSocialPosts = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('generateSocialPosts', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const fallbackSocial = generateSocialFallback({ content });

  try {
    const systemPrompt = SYSTEM_PROMPTS.social;
    const userPrompt = USER_PROMPT_BUILDERS.social({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.SOCIAL,
      prompt: userPrompt,
      response: result.content,
    });

    const twitterText =
      formatSocialPlatformPost(parsed?.twitter) || fallbackSocial.twitter;
    const linkedinText =
      formatSocialPlatformPost(parsed?.linkedin) || fallbackSocial.linkedin;
    const facebookText =
      formatSocialPlatformPost(parsed?.facebook) || fallbackSocial.socialPost;

    const mainPost =
      formatSocialPlatformPost(parsed?.socialPost) ||
      twitterText ||
      linkedinText ||
      fallbackSocial.socialPost;

    const responseData = {
      socialPost: mainPost,
      twitter: twitterText,
      linkedin: linkedinText,
      facebook: facebookText,
      platforms: {
        twitter: twitterText,
        linkedin: linkedinText,
        facebook: facebookText,
      },
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI generateSocialPosts failed, returning fallback post', {
      error: error.message,
    });
    aiCache.set(cacheKey, fallbackSocial);
    return fallbackSocial;
  }
};

const applySuggestions = async ({ content, suggestions }, userId) => {
  const cacheKey = aiCache.generateKey('applySuggestions', {
    content,
    suggestions,
  });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const systemPrompt = SYSTEM_PROMPTS.applySuggestions;
    const userPrompt = USER_PROMPT_BUILDERS.applySuggestions({
      content,
      suggestions,
    });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.APPLY_SUGGESTIONS,
      prompt: userPrompt,
      response: result.content,
    });

    const appliedContent = formatToRichHTML(
      stripReasoning(parsed?.appliedContent || result.content)
    );

    const responseData = {
      ...parsed,
      appliedContent: appliedContent || content,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn('AI applySuggestions failed, returning original content', {
      error: error.message,
    });
    const fallbackRes = {
      appliedContent: content,
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

const generateSuggestions = async ({ content }, userId) => {
  const cacheKey = aiCache.generateKey('generateSuggestions', { content });
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const systemPrompt = SYSTEM_PROMPTS.suggestions;
    const userPrompt = USER_PROMPT_BUILDERS.suggestions({ content });

    const result = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 4096,
    });

    const parsed = extractJSON(result.content);
    await logAIGeneration({
      userId,
      type: AI_GENERATION_TYPES.SUGGESTIONS,
      prompt: userPrompt,
      response: result.content,
    });

    const defaultSuggestions = [
      'Break down large paragraphs into concise subheadings for better readability.',
      'Include concrete code snippets or real-world examples to support key claims.',
      'Review section transitions to strengthen logical flow.',
    ];

    const responseData = {
      suggestions:
        Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : defaultSuggestions,
      tokenUsage: result.tokenUsage,
    };
    aiCache.set(cacheKey, responseData);
    return responseData;
  } catch (error) {
    logger.warn(
      'AI generateSuggestions failed, returning default suggestions',
      {
        error: error.message,
      }
    );
    const fallbackRes = {
      suggestions: [
        'Break down large paragraphs into concise subheadings for better readability.',
        'Include concrete code snippets or real-world examples to support key claims.',
        'Review section transitions to strengthen logical flow.',
      ],
      fallback: true,
    };
    aiCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }
};

module.exports = {
  generateAIResponse,
  generatePost,
  generateTitles,
  improveTitle,
  generateExcerpt,
  generateTags,
  generateSEO,
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
};
