const { Router } = require('express');
const { optionalAuth } = require('../../middleware/auth.middleware');
const { getUserPosts } = require('./user.controller');

const router = Router();

router.get('/:id/posts', optionalAuth, getUserPosts);

module.exports = router;
