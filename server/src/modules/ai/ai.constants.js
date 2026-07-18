const AI_TONES = [
  'professional',
  'friendly',
  'casual',
  'technical',
  'academic',
  'storytelling',
];

const AI_CATEGORIES = [
  'technology',
  'lifestyle',
  'health',
  'business',
  'education',
  'entertainment',
  'science',
  'travel',
  'food',
  'finance',
  'sports',
  'politics',
  'culture',
  'other',
];

const AI_LENGTHS = {
  short: { min: 300, max: 800, label: 'Short (300-800 words)' },
  medium: { min: 800, max: 1500, label: 'Medium (800-1500 words)' },
  long: { min: 1500, max: 2500, label: 'Long (1500-2500 words)' },
  comprehensive: {
    min: 2500,
    max: 5000,
    label: 'Comprehensive (2500-5000 words)',
  },
};

const AI_GENERATION_TYPES = {
  BLOG: 'BLOG',
  SEO: 'SEO',
  REWRITE: 'REWRITE',
  TITLE: 'TITLE',
  EXCERPT: 'EXCERPT',
  TAGS: 'TAGS',
  IMPROVE: 'IMPROVE',
  EXPAND: 'EXPAND',
  SHORTEN: 'SHORTEN',
  CONTINUE: 'CONTINUE',
  SUMMARIZE: 'SUMMARIZE',
  FAQ: 'FAQ',
  SOCIAL: 'SOCIAL',
  SUGGESTIONS: 'SUGGESTIONS',
  APPLY_SUGGESTIONS: 'APPLY_SUGGESTIONS',
};

const AI_DEFAULT_CONFIG = {
  temperature: 0.7,
  top_p: 0.95,
  maxTokens: 2048,
  model: process.env.AI_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
};

const AI_STREAM_CONFIG = {
  maxTokens: 4096,
  temperature: 0.7,
  top_p: 0.95,
};

const AI_TIMEOUT = 60000;

const MAX_INPUT_LENGTH = 50000;

module.exports = {
  AI_TONES,
  AI_CATEGORIES,
  AI_LENGTHS,
  AI_GENERATION_TYPES,
  AI_DEFAULT_CONFIG,
  AI_STREAM_CONFIG,
  AI_TIMEOUT,
  MAX_INPUT_LENGTH,
};
