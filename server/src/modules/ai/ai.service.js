const OpenAI = require('openai');
const prisma = require('../../config/db');
const { AI_DEFAULT_CONFIG, AI_GENERATION_TYPES } = require('./ai.constants');
const { SYSTEM_PROMPTS, USER_PROMPT_BUILDERS } = require('./ai.prompts');
const { extractJSON, buildTokenUsage, parseAIResponse } = require('./ai.utils');

let aiClient = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.NVIDIA_API_KEY;
    const baseURL =
      process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';

    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY environment variable is not configured.');
    }

    aiClient = new OpenAI({
      apiKey,
      baseURL,
      timeout: 60000,
      maxRetries: 2,
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

  const requestOptions = {
    model,
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
    const tokenUsage = buildTokenUsage(response, model, Date.now());
    const content = parseAIResponse(response);
    return { content, tokenUsage };
  } catch (err) {
    if (err.status === 403) {
      throw new Error(
        'NVIDIA API access denied (403). Your API key may be invalid, expired, or lacks access to the model. Get a new key at https://build.nvidia.com'
      );
    }
    throw err;
  }
};

const logAIGeneration = async ({ userId, postId, type, prompt, response }) => {
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
    console.error('Failed to log AI generation:', error.message);
  }
};

const generatePost = async (
  { topic, targetAudience, tone, category, keywords, approximateLength },
  userId
) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const generateTitles = async ({ content, keywords }, userId) => {
  const systemPrompt = SYSTEM_PROMPTS.title;
  const userPrompt = USER_PROMPT_BUILDERS.title({ content, keywords });

  const result = await generateAIResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.8,
    maxTokens: 2048,
  });

  const parsed = extractJSON(result.content);
  await logAIGeneration({
    userId,
    type: AI_GENERATION_TYPES.TITLE,
    prompt: userPrompt,
    response: result.content,
  });

  return {
    titles: Array.isArray(parsed) ? parsed : [],
    tokenUsage: result.tokenUsage,
  };
};

const improveTitle = async ({ currentTitle, targetKeyword }, userId) => {
  const systemPrompt = SYSTEM_PROMPTS.improveTitle;
  const userPrompt = USER_PROMPT_BUILDERS.improveTitle({
    currentTitle,
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const generateExcerpt = async ({ content }, userId) => {
  const systemPrompt = SYSTEM_PROMPTS.excerpt;
  const userPrompt = USER_PROMPT_BUILDERS.excerpt({ content });

  const result = await generateAIResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 512,
  });

  const excerpt = result.content.trim();
  await logAIGeneration({
    userId,
    type: AI_GENERATION_TYPES.EXCERPT,
    prompt: userPrompt,
    response: excerpt,
  });

  return {
    excerpt,
    tokenUsage: result.tokenUsage,
  };
};

const generateTags = async ({ content }, userId) => {
  const systemPrompt = SYSTEM_PROMPTS.tags;
  const userPrompt = USER_PROMPT_BUILDERS.tags({ content });

  const result = await generateAIResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 512,
  });

  const parsed = extractJSON(result.content);
  const tags = Array.isArray(parsed)
    ? [...new Set(parsed.map((t) => t.toLowerCase().trim()))].slice(0, 10)
    : [];

  await logAIGeneration({
    userId,
    type: AI_GENERATION_TYPES.TAGS,
    prompt: userPrompt,
    response: result.content,
  });

  return {
    tags,
    tokenUsage: result.tokenUsage,
  };
};

const generateSEO = async ({ title, content }, userId) => {
  const systemPrompt = SYSTEM_PROMPTS.seo;
  const userPrompt = USER_PROMPT_BUILDERS.seo({ title, content });

  const result = await generateAIResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.5,
    maxTokens: 2048,
  });

  const parsed = extractJSON(result.content);
  await logAIGeneration({
    userId,
    type: AI_GENERATION_TYPES.SEO,
    prompt: userPrompt,
    response: result.content,
  });

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const improveWriting = async ({ content }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const rewriteContent = async ({ content, tone }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const expandContent = async ({ content }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const shortenContent = async ({ content }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const continueWriting = async ({ content }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const summarizeContent = async ({ content }, userId) => {
  const systemPrompt = SYSTEM_PROMPTS.summarize;
  const userPrompt = USER_PROMPT_BUILDERS.summarize({ content });

  const result = await generateAIResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 2048,
  });

  const parsed = extractJSON(result.content);
  await logAIGeneration({
    userId,
    type: AI_GENERATION_TYPES.SUMMARIZE,
    prompt: userPrompt,
    response: result.content,
  });

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const generateFAQ = async ({ content }, userId) => {
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

  return {
    faqs: Array.isArray(parsed) ? parsed : [],
    tokenUsage: result.tokenUsage,
  };
};

const generateSocialPosts = async ({ content }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const applySuggestions = async ({ content, suggestions }, userId) => {
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

  return {
    ...parsed,
    tokenUsage: result.tokenUsage,
  };
};

const generateSuggestions = async ({ content }, userId) => {
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

  return {
    suggestions: Array.isArray(parsed) ? parsed : [],
    tokenUsage: result.tokenUsage,
  };
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
