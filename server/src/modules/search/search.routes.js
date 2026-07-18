const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { protect, optionalAuth } = require('../../middleware/auth.middleware');
const {
  globalSearch,
  getSuggestions,
  getTrending,
  getHistory,
  deleteHistory,
  getPopularTags,
  getDiscoverAuthors,
} = require('./search.controller');

const router = Router();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many search requests. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(searchLimiter);

router.get('/', optionalAuth, globalSearch);
router.get('/suggestions', getSuggestions);
router.get('/trending', getTrending);
router.get('/history', protect, getHistory);
router.delete('/history', protect, deleteHistory);
router.get('/popular-tags', getPopularTags);
router.get('/authors', getDiscoverAuthors);

module.exports = router;
