const { cleanPlainText, formatToRichHTML } = require('./ai.utils');

const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  "aren't",
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  "can't",
  'cannot',
  'could',
  "couldn't",
  'did',
  "didn't",
  'do',
  'does',
  "doesn't",
  'doing',
  "don't",
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  "hadn't",
  'has',
  "hasn't",
  'have',
  "haven't",
  'having',
  'he',
  "he'd",
  "he'll",
  "he's",
  'her',
  'here',
  "here's",
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  "how's",
  'i',
  "i'd",
  "i'll",
  "i'm",
  "i've",
  'if',
  'in',
  'into',
  'is',
  "isn't",
  'it',
  "it's",
  'its',
  'itself',
  "let's",
  'me',
  'more',
  'most',
  "mustn't",
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  "shan't",
  'she',
  "she'd",
  "she'll",
  "she's",
  'should',
  "shouldn't",
  'so',
  'some',
  'such',
  'than',
  'that',
  "that's",
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  "there's",
  'these',
  'they',
  "they'd",
  "they'll",
  "they're",
  "they've",
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  "wasn't",
  'we',
  "we'd",
  "we'll",
  "we're",
  "we've",
  'were',
  "weren't",
  'what',
  "what's",
  'when',
  "when's",
  'where',
  "where's",
  'which',
  'while',
  'who',
  "who's",
  'whom',
  'why',
  "why's",
  'with',
  "won't",
  'would',
  "wouldn't",
  'you',
  "you'd",
  "you'll",
  "you're",
  "you've",
  'your',
  'yours',
  'yourself',
  'yourselves',
  'will',
  'just',
  'should',
  'now',
  'also',
  'into',
  'first',
  'even',
  'then',
]);

function extractKeywords(text, limit = 8) {
  if (!text || typeof text !== 'string')
    return ['technology', 'guide', 'innovation'];
  const plain = cleanPlainText(text).toLowerCase();
  const words = plain.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);
  const freq = new Map();

  for (const word of words) {
    if (word.length >= 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }

  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  const result = Array.from(new Set(sorted)).slice(0, limit);
  return result.length > 0
    ? result
    : ['Technology', 'Software', 'Development', 'Guide'];
}

function extractSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const plain = cleanPlainText(text);
  return plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function formatHeading(str) {
  if (!str) return 'Modern Web Development';
  const clean = cleanPlainText(str);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// 1. Full Post Generator Fallback (800+ Words Structured HTML)
function generatePostFallback({ topic, keywords = '' } = {}) {
  const subject = formatHeading(topic || 'Modern Web Development');
  const kwList = Array.isArray(keywords)
    ? keywords.map(cleanPlainText).filter(Boolean)
    : typeof keywords === 'string' && keywords.trim()
      ? keywords
          .split(',')
          .map((k) => cleanPlainText(k).trim())
          .filter(Boolean)
      : extractKeywords(subject, 6);

  const tags = Array.from(
    new Set([...kwList, 'Technology', 'Innovation', 'Guide'])
  ).slice(0, 8);

  const content = `<h2>Introduction: The Rise of ${subject}</h2>
<p>${subject} is rapidly redefining modern software development and digital experiences. As technology continues to evolve, engineers, creators, and technology leaders must understand the foundational shifts shaping how we build and scale modern solutions.</p>

<p>Whether you are architecting a high-throughput platform or refining an everyday product workflow, mastering ${subject} requires balancing technical rigor with user-centric design.</p>

<h2>Core Pillars and Architectural Principles</h2>
<p>To successfully leverage ${subject}, systems must be designed around key architectural principles that ensure resilience, speed, and continuous adaptability:</p>
<ul>
  <li><strong>Scalable Architecture</strong>: Structuring workflows and components to decouple dependencies and scale gracefully under high demand.</li>
  <li><strong>Performance & Reliability</strong>: Minimizing latency, optimizing data fetching pipelines, and applying modern caching strategies.</li>
  <li><strong>Developer Experience & Ergonomics</strong>: Providing clear conventions, comprehensive documentation, and streamlined debugging cycles.</li>
  <li><strong>Security & Compliance</strong>: Embedding defense-in-depth mechanisms, input validation, and auditability at every touchpoint.</li>
</ul>

<blockquote>
  "The true value of modern engineering lies not merely in adopting the latest paradigms, but in crafting systems that empower people to solve meaningful problems with confidence and speed."
</blockquote>

<h2>Practical Implementation Strategies</h2>
<p>Moving from high-level theory to concrete execution demands a systematic approach. When implementing ${subject} in production environments, consider the following phases:</p>

<h3>1. Assessment and Baseline Telemetry</h3>
<p>Before introducing fundamental changes, benchmark your current baseline. Identify bottlenecks, latency spikes, and common failure modes through distributed tracing and real-time logs.</p>

<h3>2. Incremental Modular Rollouts</h3>
<p>Avoid big-bang migrations. Break features into modular milestones with feature flags, allowing teams to validate assumptions against real-world traffic safely.</p>

<h3>3. Continuous Automated Verification</h3>
<p>Automate regression testing, end-to-end integration validations, and synthetic canary probes. Catching edge cases early drastically reduces operational overhead.</p>

<h2>Overcoming Common Challenges</h2>
<p>Engineering teams frequently encounter predictable hurdles during adoption. Recognizing these pitfalls in advance enables proactive mitigation:</p>
<ul>
  <li><strong>Premature Complexity</strong>: Strive for simplicity first. Do not add distributed layers until measurable usage justifies the cost.</li>
  <li><strong>State Synchronization Drift</strong>: Keep source-of-truth definitions strictly unified across services to prevent stale data discrepancies.</li>
  <li><strong>Overlooking Observability</strong>: Invest early in structured dashboards and alerting thresholds rather than treating telemetry as an afterthought.</li>
</ul>

<h2>Looking Ahead: The Future of ${subject}</h2>
<p>As ecosystems mature, we anticipate deeper automation, AI-assisted development tools, and unified edge runtimes converging to make ${subject} faster and more accessible than ever. Organizations that invest in these foundations today will be best positioned to lead tomorrow.</p>

<h2>Conclusion</h2>
<p>Mastering ${subject} is an ongoing journey of refinement and discovery. By embracing decoupled design, disciplined iteration, and user-focused engineering, you can build software that stands the test of time.</p>`;

  const excerpt =
    `Explore essential principles, real-world architecture, and practical implementation strategies for ${subject} in modern software engineering.`.slice(
      0,
      158
    );

  return {
    title: `The Comprehensive Guide to ${subject}: Strategies, Principles, and Future Impact`,
    excerpt,
    content,
    tags,
    fallback: true,
  };
}

// 2. Titles Fallback
function generateTitlesFallback({ content, keywords } = {}) {
  const kwList = extractKeywords(
    keywords || content || 'Modern Web Development',
    4
  );
  const subject = kwList[0] || 'Modern Web Development';
  const secondary = kwList[1] || 'Digital Innovation';

  return {
    title: `Mastering ${subject}: Key Principles and Real-World Best Practices`,
    titles: [
      `Mastering ${subject}: Key Principles and Real-World Best Practices`,
      `The Future of ${subject}: Emerging Trends Every Creator Needs to Know`,
      `How to Build and Scale with ${subject} in Production`,
      `Essential Strategies for ${subject}: From Foundations to Advanced Architecture`,
      `Unlocking the Power of ${subject} and ${secondary}: A Comprehensive Guide`,
    ],
    fallback: true,
  };
}

// 3. Excerpt Fallback
function generateExcerptFallback({ content, title } = {}) {
  const sentences = extractSentences(content || title || '');
  if (sentences.length > 0) {
    const candidate = sentences.slice(0, 2).join(' ');
    if (candidate.length <= 158) return { excerpt: candidate, fallback: true };
    const truncated = candidate.slice(0, 155);
    const lastSpace = truncated.lastIndexOf(' ');
    return {
      excerpt:
        (lastSpace > 50 ? truncated.slice(0, lastSpace) : truncated) + '...',
      fallback: true,
    };
  }
  const cleanTitle = cleanPlainText(title || 'Modern Web Development');
  return {
    excerpt:
      `Explore actionable insights and core architectural strategies for ${cleanTitle} in modern software engineering.`.slice(
        0,
        155
      ),
    fallback: true,
  };
}

// 4. Tags Fallback
function generateTagsFallback({ content, keywords } = {}) {
  const extracted = extractKeywords(`${keywords || ''} ${content || ''}`, 8);
  const fallbackDefaults = [
    'Technology',
    'Programming',
    'WebDev',
    'Guide',
    'Architecture',
    'Innovation',
  ];
  const combined = Array.from(
    new Set([...extracted, ...fallbackDefaults])
  ).slice(0, 8);
  return {
    tags: combined,
    fallback: true,
  };
}

// 5. SEO Fallback
function generateSeoFallback({ title, content } = {}) {
  const safeTitle = cleanPlainText(title || 'Modern Web Development Guide');
  const kwList = extractKeywords(`${safeTitle} ${content || ''}`, 5);
  const focusKeyword = kwList[0] || 'Web Development';
  const excerptResult = generateExcerptFallback({ content, title: safeTitle });

  const slug = safeTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const metaTitle = `${safeTitle} | PixelThread Guide`.slice(0, 60);
  const metaDescription = excerptResult.excerpt.slice(0, 158);

  return {
    metaTitle,
    seoTitle: metaTitle,
    metaDescription,
    seoDescription: metaDescription,
    ogTitle: safeTitle,
    ogDescription: metaDescription,
    focusKeyword,
    keywords: kwList,
    canonicalSlug: slug,
    recommendations: [
      `Include target keyword "${focusKeyword}" in the introductory paragraph.`,
      'Ensure primary heading (h1/h2) highlights the core takeaway.',
      'Add descriptive alt text to all embedded diagrams and images.',
      'Use bulleted lists and subheadings (h3) to optimize mobile readability.',
    ],
    fallback: true,
  };
}

// 6. FAQ Fallback
function generateFAQFallback({ content, title } = {}) {
  const subject = formatHeading(
    title || extractKeywords(content, 1)[0] || 'this topic'
  );
  return {
    faqs: [
      {
        question: `What are the primary benefits of implementing ${subject}?`,
        answer: `${subject} streamlines system architecture, boosts operational performance, and empowers teams to build scalable, resilient solutions faster.`,
      },
      {
        question: `What common challenges should teams anticipate?`,
        answer: `Common challenges include premature optimization, managing state complexity, and ensuring consistent observability across all modules.`,
      },
      {
        question: `How can beginners or teams get started?`,
        answer: `Start by establishing modular prototypes, prioritizing clean code standards, and measuring user outcomes incrementally.`,
      },
      {
        question: `How does ${subject} impact long-term scalability?`,
        answer: `By establishing clear separation of concerns and robust data patterns, systems adapt gracefully to increased traffic and evolving requirements.`,
      },
    ],
    fallback: true,
  };
}

// 7. Social Posts Fallback
function generateSocialFallback({ content, title, platform } = {}) {
  const subject = formatHeading(
    title || extractKeywords(content, 1)[0] || 'Modern Software Engineering'
  );
  const hashtags = extractKeywords(`${subject} ${content || ''}`, 4)
    .map((k) => `#${k.replace(/[^a-zA-Z0-9]/g, '')}`)
    .join(' ');

  const twitterPost = `🚀 Excited to share our deep dive on ${subject}!

Key takeaways:
• Scalable architecture & resilience
• Performance optimizations that matter
• Actionable best practices for modern developers

Read the full breakdown on PixelThread 👇
${hashtags || '#Tech #WebDev'}`;

  const linkedinPost = `Continuous learning is essential in modern software engineering.

In our latest article on PixelThread, we explore the core principles behind ${subject}—from foundational architecture to practical production strategies that drive long-term scalability.

Key highlights:
✓ Decoupled components for seamless growth
✓ Real-world performance patterns
✓ Mitigating common architectural pitfalls

Check out the full guide and join the conversation!

${hashtags || '#SoftwareEngineering #TechTrends #WebDevelopment'}`;

  const facebookPost = `Looking to level up your skills in ${subject}? Our latest guide on PixelThread breaks down everything you need to know, with practical tips and architectural principles for modern teams. Check it out today! ${hashtags}`;

  return {
    socialPost: (platform || '').toLowerCase().includes('linkedin')
      ? linkedinPost
      : twitterPost,
    twitter: twitterPost,
    linkedin: linkedinPost,
    facebook: facebookPost,
    fallback: true,
  };
}

// 8. Continue Writing Fallback
function continueWritingFallback({ content, guidance } = {}) {
  const subject = formatHeading(
    extractKeywords(content, 2).join(' & ') || 'Implementation'
  );
  const direction = guidance
    ? ` Focusing particularly on ${guidance}, `
    : ` Focusing on ${subject}, `;

  const continuation = `<p>Building on these foundational principles,${direction}the next critical step is translating strategic concepts into structured execution. Teams must establish clear operational workflows to validate assumptions early.</p>

<h3>Key Execution Milestones</h3>
<ul>
  <li><strong>Iterative Validation</strong>: Deploy incremental releases to gather direct, real-world user feedback.</li>
  <li><strong>Telemetry & Monitoring</strong>: Implement end-to-end observability to catch edge cases and performance bottlenecks before they impact end users.</li>
  <li><strong>Continuous Documentation</strong>: Keep architectural decision records (ADRs) up to date so new contributors can onboard seamlessly.</li>
</ul>

<p>By treating development as a continuous feedback loop rather than a rigid sequence, engineering teams consistently maintain momentum and deliver lasting value.</p>`;

  return {
    continuation,
    fallback: true,
  };
}

// 9. Improve Writing Fallback
function improveWritingFallback({ content } = {}) {
  const clean = cleanPlainText(content || '');
  const sentences = extractSentences(clean);
  if (sentences.length === 0) {
    return {
      improvedContent:
        '<p>Modern development emphasizes high cohesion, loose coupling, and continuous verification across all application layers.</p>',
      fallback: true,
    };
  }

  const improved = sentences
    .map((s) => {
      let trimmed = s.trim();
      if (!trimmed.endsWith('.')) trimmed += '.';
      return trimmed;
    })
    .join(' ');

  return {
    improvedContent: formatToRichHTML(improved),
    fallback: true,
  };
}

// 10. Rewrite Content Fallback
function rewriteContentFallback({ content, tone = 'professional' } = {}) {
  const sentences = extractSentences(content || '');
  const subject = extractKeywords(content, 1)[0] || 'this architecture';

  let transformed = '';
  switch ((tone || '').toLowerCase()) {
    case 'engaging':
    case 'storytelling':
      transformed = `<p>Imagine building systems that effortlessly scale alongside your ambition. At its core, ${subject} unlocks unprecedented speed and clarity.</p><p>${sentences.slice(0, 3).join(' ')}</p>`;
      break;
    case 'persuasive':
      transformed = `<p>Adopting ${subject} is no longer optional—it is a competitive necessity. Prioritizing decoupled architecture directly accelerates time-to-market.</p><p>${sentences.slice(0, 3).join(' ')}</p>`;
      break;
    case 'technical':
      transformed = `<p><strong>Architectural Specification:</strong> Core components must decouple state persistence from execution pipelines. ${sentences.slice(0, 3).join(' ')}</p>`;
      break;
    default:
      transformed = `<p>In modern engineering practices, ${subject} serves as a foundational pillar for reliability and developer agility. ${sentences.slice(0, 3).join(' ')}</p>`;
  }

  return {
    rewrittenContent: formatToRichHTML(transformed),
    fallback: true,
  };
}

// 11. Expand Content Fallback
function expandContentFallback({ content } = {}) {
  const sentences = extractSentences(content || '');
  const first =
    sentences[0] || 'Modern systems require robust architectural foundations.';

  const expanded = `<p>${first}</p>
<p>To fully appreciate the implications of this approach, we must examine both the underlying mechanisms and the operational trade-offs involved:</p>
<ul>
  <li><strong>Structural Modularity</strong>: Isolating key logic paths ensures that unexpected failures remain strictly localized.</li>
  <li><strong>Performance Profiling</strong>: Analyzing latency distributions and memory footprint early prevents systemic bottlenecks at scale.</li>
  <li><strong>Empirical Telemetry</strong>: Real-world operational metrics provide actionable data that guides continuous refactoring.</li>
</ul>
<p>${sentences.slice(1).join(' ') || 'By systematically addressing each dimension, engineering organizations sustain rapid delivery without compromising code quality or system stability.'}</p>`;

  return {
    expandedContent: formatToRichHTML(expanded),
    fallback: true,
  };
}

// 12. Shorten Content Fallback
function shortenContentFallback({ content } = {}) {
  const sentences = extractSentences(content || '');
  const condensed =
    sentences.slice(0, Math.min(2, sentences.length)).join(' ') ||
    'Prioritize modular design, continuous verification, and user outcomes.';

  return {
    shortenedContent: `<p>${condensed}</p>`,
    fallback: true,
  };
}

// 13. Summarize Content Fallback
function summarizeContentFallback({ content } = {}) {
  const sentences = extractSentences(content || '');
  const kwList = extractKeywords(content, 4);

  const oneLiner =
    sentences[0] ||
    'A comprehensive breakdown of modern development strategies and practical principles.';
  const paragraph = sentences.slice(0, 3).join(' ') || oneLiner;

  const bullets = [
    `Foundational concepts centered on ${kwList[0] || 'robust architecture'} and scalable execution.`,
    `Performance optimization and continuous telemetry to catch bottlenecks early.`,
    `Human-centered approach balancing developer agility with real-world user value.`,
  ];

  return {
    oneLineSummary: oneLiner,
    paragraphSummary: paragraph,
    bulletSummary: bullets,
    summary: `<p><strong>TL;DR:</strong> ${oneLiner}</p><p>${paragraph}</p><ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`,
    content: `<p><strong>Executive Summary:</strong> ${paragraph}</p><ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`,
    fallback: true,
  };
}

module.exports = {
  extractKeywords,
  extractSentences,
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
};
