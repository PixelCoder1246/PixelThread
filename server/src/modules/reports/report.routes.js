const { Router } = require('express');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const {
  reportPost,
  reportComment,
  reportUser,
  getReports,
  getReportById,
  changeReportStatus,
  resolveReport,
  rejectReport,
  getReportAnalytics,
} = require('./report.controller');

const router = Router();

router.post('/posts/:id/report', protect, reportPost);
router.post('/comments/:id/report', protect, reportComment);
router.post('/users/:id/report', protect, reportUser);

router.get(
  '/admin/reports/analytics',
  protect,
  restrictTo('ADMIN'),
  getReportAnalytics
);
router.get('/admin/reports', protect, restrictTo('ADMIN'), getReports);
router.get('/admin/reports/:id', protect, restrictTo('ADMIN'), getReportById);
router.patch(
  '/admin/reports/:id/status',
  protect,
  restrictTo('ADMIN'),
  changeReportStatus
);
router.patch(
  '/admin/reports/:id/resolve',
  protect,
  restrictTo('ADMIN'),
  resolveReport
);
router.patch(
  '/admin/reports/:id/reject',
  protect,
  restrictTo('ADMIN'),
  rejectReport
);

module.exports = router;
