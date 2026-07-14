const extractTextFromContent = (content) => {
  if (!Array.isArray(content)) return '';
  return content
    .filter((block) => block && block.value && typeof block.value === 'string')
    .map((block) => block.value)
    .join(' ');
};

const calculateSeoScore = ({ postTitle, content, excerpt, seo }) => {
  let score = 0;

  const metaTitle = (seo?.metaTitle || '').trim();
  const metaDescription = (seo?.metaDescription || '').trim();
  const keywords = Array.isArray(seo?.keywords) ? seo.keywords : [];
  const canonicalUrl = (seo?.canonicalUrl || '').trim();
  const excerptText = (excerpt || '').trim();
  const title = (postTitle || '').trim();
  const plainContent = extractTextFromContent(content);

  const uniqueKeywords = [...new Set(keywords.map((k) => k.toLowerCase()))];
  const focusKeyword = uniqueKeywords.length > 0 ? uniqueKeywords[0] : null;

  if (title.length > 0) score += 5;
  if (title.length >= 30 && title.length <= 60) score += 10;

  if (metaTitle.length > 0) score += 10;
  if (metaTitle.length >= 50 && metaTitle.length <= 60) score += 10;

  if (metaDescription.length > 0) score += 10;
  if (metaDescription.length >= 120 && metaDescription.length <= 160)
    score += 10;

  if (keywords.length > 0) score += 10;
  if (uniqueKeywords.length >= 3) score += 5;
  if (keywords.length === uniqueKeywords.length && keywords.length > 0)
    score += 5;

  if (canonicalUrl.length > 0) score += 10;
  if (canonicalUrl.startsWith('https://')) score += 5;

  if (excerptText.length > 0) score += 5;
  if (excerptText.length >= 120 && excerptText.length <= 200) score += 5;

  if (focusKeyword) {
    const lowerTitle = title.toLowerCase();
    const lowerMetaTitle = metaTitle.toLowerCase();
    const lowerMetaDesc = metaDescription.toLowerCase();
    const lowerContent = plainContent.toLowerCase();

    if (lowerTitle.includes(focusKeyword)) score += 5;
    if (lowerMetaTitle.includes(focusKeyword)) score += 5;
    if (lowerMetaDesc.includes(focusKeyword)) score += 5;
    if (lowerContent.includes(focusKeyword)) score += 5;
  }

  return Math.min(100, score);
};

module.exports = { calculateSeoScore };
