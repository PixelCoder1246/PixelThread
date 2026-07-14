const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { calculateSeoScore } = require('./seo-score.service');
const { generateSuggestions } = require('./seo-suggestion.service');

const findPostById = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      seo: true,
    },
  });
  if (!post) throw new ApiError(404, 'Post not found.');
  return post;
};

const ensureSeoMeta = async (postId) => {
  let seo = await prisma.seoMeta.findUnique({ where: { postId } });
  if (!seo) {
    seo = await prisma.seoMeta.create({
      data: { postId },
    });
  }
  return seo;
};

const buildSeoResponse = (post, seo) => {
  const score = calculateSeoScore({
    postTitle: post.title,
    content: post.content,
    excerpt: post.excerpt,
    seo,
  });

  const suggestions = generateSuggestions({
    postTitle: post.title,
    content: post.content,
    excerpt: post.excerpt,
    seo,
  });

  return {
    metaTitle: seo.metaTitle || null,
    metaDescription: seo.metaDescription || null,
    keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
    canonicalUrl: seo.canonicalUrl || null,
    score,
    suggestions,
  };
};

const getSeoByPostId = async (postId) => {
  const post = await findPostById(postId);
  const seo = await ensureSeoMeta(postId);
  return buildSeoResponse(post, seo);
};

const updateSeo = async (postId, data, userId, userRole) => {
  const post = await findPostById(postId);

  if (post.authorId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(
      403,
      'You do not have permission to update SEO for this post.'
    );
  }

  const seo = await ensureSeoMeta(postId);

  const updateData = {};

  if (data.metaTitle !== undefined) {
    updateData.metaTitle = data.metaTitle.trim();
  }
  if (data.metaDescription !== undefined) {
    updateData.metaDescription = data.metaDescription.trim();
  }
  if (data.keywords !== undefined) {
    const normalized = (Array.isArray(data.keywords) ? data.keywords : [])
      .filter((k) => k && typeof k === 'string')
      .map((k) => k.trim().toLowerCase());
    updateData.keywords = [...new Set(normalized)];
  }
  if (data.canonicalUrl !== undefined) {
    updateData.canonicalUrl = data.canonicalUrl.trim();
  }

  if (Object.keys(updateData).length > 0) {
    const score = calculateSeoScore({
      postTitle: post.title,
      content: post.content,
      excerpt: post.excerpt,
      seo: { ...seo, ...updateData },
    });
    updateData.score = score;
  }

  const updated = await prisma.seoMeta.update({
    where: { postId },
    data: updateData,
  });

  const fullSeo = { ...seo, ...updated };

  const suggestions = generateSuggestions({
    postTitle: post.title,
    content: post.content,
    excerpt: post.excerpt,
    seo: fullSeo,
  });

  return {
    metaTitle: fullSeo.metaTitle || null,
    metaDescription: fullSeo.metaDescription || null,
    keywords: Array.isArray(fullSeo.keywords) ? fullSeo.keywords : [],
    canonicalUrl: fullSeo.canonicalUrl || null,
    score: fullSeo.score || 0,
    suggestions,
  };
};

const recalculateForPost = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { seo: true },
  });

  if (!post || !post.seo) return null;

  const score = calculateSeoScore({
    postTitle: post.title,
    content: post.content,
    excerpt: post.excerpt,
    seo: post.seo,
  });

  await prisma.seoMeta.update({
    where: { postId },
    data: { score },
  });

  return score;
};

module.exports = {
  getSeoByPostId,
  updateSeo,
  recalculateForPost,
};
