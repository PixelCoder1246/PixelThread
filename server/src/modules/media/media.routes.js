const { Router } = require('express');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const {
  uploadMedia,
  deleteMedia,
  replaceMedia,
  getMyMedia,
} = require('./media.controller');

router.get('/me/media', protect, getMyMedia);
router.post('/media', protect, upload.single('file'), uploadMedia);
router.patch('/media/:id', protect, upload.single('file'), replaceMedia);
router.delete('/media/:id', protect, deleteMedia);

module.exports = router;
