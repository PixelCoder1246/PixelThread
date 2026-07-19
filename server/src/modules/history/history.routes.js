const { Router } = require('express');
const { protect } = require('../../middleware/auth.middleware');
const {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} = require('./history.controller');

const router = Router();

router.get('/me/history', protect, getHistory);
router.delete('/me/history', protect, clearHistory);
router.delete('/me/history/:id', protect, deleteHistoryItem);

module.exports = router;
