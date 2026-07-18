const SYSTEM_PROMPTS = {
  generatePost: `You are an expert blog writer and SEO strategist. Generate a complete blog post based on the given parameters. Return ONLY valid JSON with no markdown formatting or code blocks. Do not include any analysis, reasoning, or explanation. The JSON must have these exact keys: title, excerpt, content (full markdown), suggestedTags (array of strings), seoTitle, seoDescription.`,

  title: `You are an expert in blog title optimization. Generate 5 unique, compelling blog titles based on the given content. Return ONLY valid JSON as an array of objects. Do not include any analysis, reasoning, or explanation. Each object must have: title (string), confidenceScore (0-100), seoScore (0-100), clickabilityScore (0-100).`,

  improveTitle: `You are an expert copywriter specializing in headline optimization. Improve the given blog title to make it more compelling, clickable, and SEO-friendly while preserving its core message. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  excerpt: `You are an expert at writing compelling blog excerpts. Generate a concise, engaging excerpt between 120-160 characters that accurately represents the content and entices readers to click. Do not include any analysis, reasoning, or explanation. Output only the excerpt text and nothing else.`,

  tags: `You are an expert at categorizing content and generating relevant tags. Generate 5-10 highly relevant tags for the given content. Return ONLY a JSON array of strings ordered by relevance. Do not include any analysis, reasoning, or explanation.`,

  seo: `You are an expert SEO strategist. Analyze the given blog title and content, then generate comprehensive SEO metadata and actionable recommendations. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  improve: `You are an expert editor. Improve the given text by fixing grammar, enhancing readability, and clarifying meaning while preserving the author's original voice and intent. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  rewrite: `You are an expert content writer. Rewrite the given article in the specified tone while keeping all factual information intact. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  expand: `You are an expert content writer. Expand the given article by adding relevant explanations, examples, and smooth transitions. Do not introduce unrelated information. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  shorten: `You are an expert editor. Shorten the given content while preserving all key ideas and important information. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  continue: `You are an expert writer. Continue the given content naturally, maintaining the same style, tone, and context. Return ONLY valid JSON with no markdown formatting or code blocks. Do not include any analysis, reasoning, or explanation.`,

  summarize: `You are an expert at distilling content into concise summaries. Generate a one-line summary, a paragraph summary, and a bullet-point summary of the given content. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  faq: `You are an expert at generating FAQ sections from blog content. Generate 5-10 frequently asked questions with concise, accurate answers based solely on the article content. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  social: `You are an expert social media content strategist. Generate platform-specific posts for LinkedIn, X (Twitter), and Facebook based on the given blog content. Include relevant hashtags. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  suggestions: `You are an expert writing coach. Analyze the given draft and provide actionable suggestions to improve it. Focus on structure, readability, engagement, and SEO. Return ONLY valid JSON. Do not include any analysis, reasoning, or explanation.`,

  applySuggestions: `You are an expert editor and content optimizer. Given a piece of content and a set of suggestions, apply each suggestion directly to improve the content. Rewrite, restructure, and enhance the content as needed. Preserve the author's voice, factual accuracy, and original intent. Return ONLY valid JSON with no markdown formatting or code blocks. Do not include any analysis, reasoning, or explanation.`,
};

const USER_PROMPT_BUILDERS = {
  generatePost: ({
    topic,
    targetAudience,
    tone,
    category,
    keywords,
    approximateLength,
  }) => {
    const lengthGuide = approximateLength
      ? `Target length: ${approximateLength}`
      : 'Target length: medium (800-1500 words)';
    return `Generate a complete blog post with the following parameters:

Topic: ${topic}
Target Audience: ${targetAudience || 'General'}
Tone: ${tone || 'Professional'}
Category: ${category || 'General'}
Keywords: ${keywords || 'None specified'}
${lengthGuide}

Return ONLY valid JSON with these exact keys. No analysis, reasoning, explanation, or formatting:
- title: compelling blog title
- excerpt: 120-160 character excerpt
- content: full blog post in markdown format
- suggestedTags: array of 5-10 relevant tag strings
- seoTitle: SEO-optimized title (max 60 chars)
- seoDescription: SEO meta description (max 160 chars)`;
  },

  title: ({ content, keywords }) => {
    let prompt = `Based on the following blog content, generate 5 unique, compelling titles.\n\nBlog Content:\n${content}\n\n`;
    if (keywords) {
      prompt += `Target Keywords: ${keywords}\n\n`;
    }
    prompt += `Return ONLY valid JSON — an array of 5 objects. No analysis, reasoning, explanation, or formatting. Each object must have: title (string), confidenceScore (0-100), seoScore (0-100), clickabilityScore (0-100).`;
    return prompt;
  },

  improveTitle: ({ currentTitle, targetKeyword }) => {
    let prompt = `Improve the following blog title:\n\nCurrent Title: "${currentTitle}"\n\n`;
    if (targetKeyword) {
      prompt += `Target Keyword: "${targetKeyword}"\n\n`;
    }
    prompt += `Return ONLY valid JSON. No analysis, reasoning, explanation, or formatting. Keys: improvedTitle (string), explanation (string describing what was changed and why).`;
    return prompt;
  },

  excerpt: ({ content }) => {
    return `Generate a compelling blog excerpt between 120-160 characters for the following content. The excerpt should be suitable for search engine previews and social sharing.\n\nContent:\n${content}\n\nReturn ONLY the excerpt text — no analysis, reasoning, explanation, JSON, or formatting. Nothing else.`;
  },

  tags: ({ content }) => {
    return `Analyze the following content and generate 5-10 highly relevant tags. Remove any duplicates. Return ONLY a JSON array of strings ordered by relevance. No analysis, reasoning, or explanation.\n\nContent:\n${content}`;
  },

  seo: ({ title, content }) => {
    return `Analyze the following blog post and generate comprehensive SEO metadata and recommendations.\n\nTitle: ${title}\n\nContent:\n${content}\n\nReturn ONLY valid JSON with these exact keys. No analysis, reasoning, explanation, or formatting: seoTitle (string, max 60 chars), metaDescription (string, max 160 chars), focusKeyword (string), canonicalSlug (string), recommendations (array of strings with SEO improvement suggestions).`;
  },

  improve: ({ content }) => {
    return `Improve the following text by fixing grammar, enhancing readability, and clarifying meaning. Preserve the author's original voice and intent.\n\nText:\n${content}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "improvedContent": "",\n  "changes": []\n}`;
  },

  rewrite: ({ content, tone }) => {
    return `Rewrite the following article in a "${tone}" tone. Keep all factual information unchanged. Maintain the same key points and structure but adapt the language and style to match the specified tone.\n\nArticle:\n${content}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "rewrittenContent": "",\n  "tone": ""\n}`;
  },

  expand: ({ content }) => {
    return `Expand the following article by adding additional explanations, relevant examples, and smooth transitions. Do not introduce unrelated information. Maintain the original structure and key points.\n\nArticle:\n${content}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "expandedContent": "",\n  "expansionNotes": []\n}`;
  },

  shorten: ({ content }) => {
    return `Shorten the following content while preserving all key ideas and important information. Remove redundancy and unnecessary words.\n\nContent:\n${content}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "shortenedContent": "",\n  "originalWordCount": 0,\n  "newWordCount": 0\n}`;
  },

  continue: ({ content }) => {
    return `Continue the following article naturally from where it ends. Maintain the same writing style, tone, and context. Do not repeat what has already been written.\n\nExisting Content:\n${content}\n\nReturn ONLY valid JSON with these exact keys: continuation, transitionNotes. No analysis, reasoning, explanation, or formatting.\n\n{\n  "continuation": "",\n  "transitionNotes": ""\n}`;
  },

  summarize: ({ content }) => {
    return `Generate three levels of summary for the following content.\n\nContent:\n${content}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "oneLineSummary": "",\n  "paragraphSummary": "",\n  "bulletPoints": []\n}`;
  },

  faq: ({ content }) => {
    return `Generate 5-10 frequently asked questions based on the following article. Each FAQ must have a question and a concise answer derived from the article content.\n\nArticle:\n${content}\n\nReturn ONLY valid JSON — an array of objects. No analysis, reasoning, explanation, or formatting. Each object must have: question, answer.\n\n[\n  {\n    "question": "",\n    "answer": ""\n  }\n]`;
  },

  social: ({ content }) => {
    return `Generate platform-specific social media posts for the following blog content. Create separate posts for LinkedIn, X (Twitter), and Facebook. Include relevant hashtags where appropriate.\n\nContent:\n${content}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "linkedin": {\n    "post": "",\n    "hashtags": []\n  },\n  "twitter": {\n    "post": "",\n    "hashtags": []\n  },\n  "facebook": {\n    "post": "",\n    "hashtags": []\n  }\n}`;
  },

  suggestions: ({ content }) => {
    return `Analyze the following blog draft and provide actionable writing suggestions. Look for: overly long paragraphs, passive voice, missing introduction or conclusion, weak call-to-action, repeated words, readability issues, and transition problems.\n\nDraft:\n${content}\n\nReturn ONLY valid JSON — an array of objects. No analysis, reasoning, explanation, or formatting. Each object must have: type, suggestion, severity ('low'/'medium'/'high'), location.\n\n[\n  {\n    "type": "",\n    "suggestion": "",\n    "severity": "",\n    "location": ""\n  }\n]`;
  },

  applySuggestions: ({ content, suggestions }) => {
    const suggestionsText = Array.isArray(suggestions)
      ? suggestions
          .map(
            (s, i) => `${i + 1}. [${s.type || 'general'}] ${s.suggestion || s}`
          )
          .join('\n')
      : suggestions || 'Improve overall quality';
    return `Apply the following suggestions to improve the content. Rewrite the content incorporating each suggestion directly.\n\nOriginal Content:\n${content}\n\nSuggestions to Apply:\n${suggestionsText}\n\nReturn ONLY valid JSON. No analysis, reasoning, explanation, or formatting.\n\n{\n  "improvedContent": "",\n  "changesApplied": [],\n  "originalWordCount": 0,\n  "newWordCount": 0\n}`;
  },
};

module.exports = {
  SYSTEM_PROMPTS,
  USER_PROMPT_BUILDERS,
};
