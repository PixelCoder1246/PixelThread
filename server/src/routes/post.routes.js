const { Router } = require('express');
const { protect, verifiedOnly } = require('../middleware/auth.middleware');
const { sendSuccess } = require('../utils/ApiResponse');

const router = Router();

router.get('/', protect, verifiedOnly, (req, res) => {
  return sendSuccess(res, 200, 'Posts fetched successfully.', {
    posts: [
      { id: '1', title: 'First Post', content: 'Hello World from PixelThread!' },
      { id: '2', title: 'Securing APIs', content: 'Use HttpOnly cookies for storing JWTs.' },
    ],
  });
});

router.post('/', protect, verifiedOnly, (req, res) => {
  const { title, content } = req.body;
  return sendSuccess(res, 201, 'Post created successfully.', {
    post: {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      authorId: req.user.id,
    },
  });
});

module.exports = router;
