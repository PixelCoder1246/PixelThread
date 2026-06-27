const prisma = require('../config/db');

/**
 * Converts a string to a URL-friendly slug.
 * Example: "My First React Post!" → "my-first-react-post"
 * @param {string} text
 * @returns {string}
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars (except spaces/hyphens)
    .replace(/[\s_]+/g, '-') // replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
};

/**
 * Generates a unique slug for a post.
 * If the base slug is taken, appends -2, -3, … until unique.
 * Optionally excludes a specific postId (used during updates to ignore self).
 *
 * @param {string} title        - The post title to slugify.
 * @param {string|null} excludeId - Post ID to exclude from uniqueness check (for updates).
 * @returns {Promise<string>}
 */
const generateUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title);

  // Check if base slug is available
  const existing = await prisma.post.findUnique({ where: { slug: base } });

  if (!existing || (excludeId && existing.id === excludeId)) {
    return base;
  }

  // Increment suffix until we find a free slot (max 1000 iterations)
  for (let counter = 2; counter <= 1000; counter += 1) {
    const candidate = `${base}-${counter}`;
    // eslint-disable-next-line no-await-in-loop
    const conflict = await prisma.post.findUnique({
      where: { slug: candidate },
    });
    if (!conflict || (excludeId && conflict.id === excludeId)) {
      return candidate;
    }
  }

  // Extremely unlikely fallback — append a random hex suffix
  return `${base}-${Math.random().toString(36).substring(2, 8)}`;
};

module.exports = { slugify, generateUniqueSlug };
