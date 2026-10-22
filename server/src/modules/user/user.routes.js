const { Router } = require('express');
const { optionalAuth } = require('../../middleware/auth.middleware');
const { getUserPosts, getUserProfile } = require('./user.controller');

const router = Router();

router.get('/:id/posts', optionalAuth, getUserPosts);
router.get('/:id', optionalAuth, getUserProfile);

module.exports = router;
