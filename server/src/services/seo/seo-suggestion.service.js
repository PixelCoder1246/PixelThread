const extractTextFromContent = (content) => {
  if (!Array.isArray(content)) return '';
  return content
    .filter((block) => block && block.value && typeof block.value === 'string')
    .map((block) => block.value)
    .join(' ');
};

const generateSuggestions = ({ postTitle, content, excerpt, seo }) => {
  const suggestions = [];

  const metaTitle = (seo?.metaTitle || '').trim();
  const metaDescription = (seo?.metaDescription || '').trim();
  const keywords = Array.isArray(seo?.keywords) ? seo.keywords : [];
  const canonicalUrl = (seo?.canonicalUrl || '').trim();
  const excerptText = (excerpt || '').trim();
  const title = (postTitle || '').trim();
  const plainContent = extractTextFromContent(content);

  const uniqueKeywords = [...new Set(keywords.map((k) => k.toLowerCase()))];
  const focusKeyword = uniqueKeywords.length > 0 ? uniqueKeywords[0] : null;

  if (!title) {
    suggestions.push('Blog title is missing.');
  } else {
    if (title.length < 30)
      suggestions.push('Blog title is too short (aim for 30–60 characters).');
    if (title.length > 60)
      suggestions.push('Blog title is too long (aim for 30–60 characters).');
  }

  if (!metaTitle) {
    suggestions.push('Meta title is missing.');
  } else {
    if (metaTitle.length < 50)
      suggestions.push('Meta title is too short (aim for 50–60 characters).');
    if (metaTitle.length > 60)
      suggestions.push('Meta title is too long (aim for 50–60 characters).');
  }

  if (!metaDescription) {
    suggestions.push('Meta description is missing.');
  } else {
    if (metaDescription.length < 120)
      suggestions.push(
        'Meta description is too short (aim for 120–160 characters).'
      );
    if (metaDescription.length > 160)
      suggestions.push(
        'Meta description is too long (aim for 120–160 characters).'
      );
  }

  if (!canonicalUrl) {
    suggestions.push('Canonical URL is missing.');
  } else if (!canonicalUrl.startsWith('https://')) {
    suggestions.push('Canonical URL should use HTTPS.');
  }

  if (keywords.length === 0) {
    suggestions.push('No keywords provided.');
  } else {
    if (keywords.length < 3)
      suggestions.push('Add at least three keywords for better SEO.');
    if (keywords.length !== uniqueKeywords.length)
      suggestions.push('Remove duplicate keywords.');
  }

  if (focusKeyword) {
    const lowerTitle = title.toLowerCase();
    const lowerMetaTitle = metaTitle.toLowerCase();
    const lowerMetaDesc = metaDescription.toLowerCase();
    const lowerContent = plainContent.toLowerCase();

    if (!lowerTitle.includes(focusKeyword))
      suggestions.push('Focus keyword is missing from the blog title.');
    if (!lowerMetaTitle.includes(focusKeyword))
      suggestions.push('Focus keyword is missing from the meta title.');
    if (!lowerMetaDesc.includes(focusKeyword))
      suggestions.push('Focus keyword is missing from the meta description.');
    if (!lowerContent.includes(focusKeyword))
      suggestions.push('Focus keyword is missing from the content.');
  }

  if (!excerptText) {
    suggestions.push('Excerpt is missing.');
  } else {
    if (excerptText.length < 120)
      suggestions.push(
        'Excerpt could be more descriptive (aim for 120–200 characters).'
      );
    if (excerptText.length > 200)
      suggestions.push('Excerpt is too long (aim for 120–200 characters).');
  }

  return suggestions;
};

module.exports = { generateSuggestions };
