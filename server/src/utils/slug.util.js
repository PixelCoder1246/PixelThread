const prisma = require('../config/db');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title);

  const existing = await prisma.post.findUnique({ where: { slug: base } });

  if (!existing || (excludeId && existing.id === excludeId)) {
    return base;
  }

  for (let counter = 2; counter <= 1000; counter += 1) {
    const candidate = `${base}-${counter}`;

    const conflict = await prisma.post.findUnique({
      where: { slug: candidate },
    });
    if (!conflict || (excludeId && conflict.id === excludeId)) {
      return candidate;
    }
  }

  return `${base}-${Math.random().toString(36).substring(2, 8)}`;
};

module.exports = { slugify, generateUniqueSlug };
