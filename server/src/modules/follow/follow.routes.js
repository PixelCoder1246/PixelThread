const { Router } = require('express');
const { protect, optionalAuth } = require('../../middleware/auth.middleware');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('./follow.controller');

const router = Router();

router.get('/:userId/followers', optionalAuth, getFollowers);
router.get('/:userId/following', optionalAuth, getFollowing);
router.post('/:userId/follow', protect, followUser);
router.delete('/:userId/follow', protect, unfollowUser);

module.exports = router;
