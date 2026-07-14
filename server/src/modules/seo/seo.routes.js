const { Router } = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { getSeo, updateSeo } = require('./seo.controller');

const router = Router();

router.get('/:id/seo', getSeo);
router.patch('/:id/seo', protect, updateSeo);

module.exports = router;
