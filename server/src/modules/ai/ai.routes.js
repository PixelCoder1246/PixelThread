const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../../middleware/auth.middleware');
const {
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
} = require('./ai.controller');

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many AI requests. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);
router.use(aiLimiter);

router.post('/generate-post', generatePost);
router.post('/title', generateTitles);
router.post('/title/improve', improveTitle);
router.post('/excerpt', generateExcerpt);
router.post('/tags', generateTags);
router.post('/seo', generateSEO);
router.post('/improve', improveWriting);
router.post('/rewrite', rewriteContent);
router.post('/expand', expandContent);
router.post('/shorten', shortenContent);
router.post('/continue', continueWriting);
router.post('/summarize', summarizeContent);
router.post('/faq', generateFAQ);
router.post('/social', generateSocialPosts);
router.post('/suggestions', generateSuggestions);

module.exports = router;
