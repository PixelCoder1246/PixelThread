const { sendSuccess } = require('../../utils/ApiResponse');
const { validateSeoUpdate, validatePostIdParam } = require('./seo.validation');
const seoService = require('../../services/seo/seo.service');

const getSeo = async (req, res, next) => {
  try {
    validatePostIdParam(req.params);
    const { id } = req.params;
    const data = await seoService.getSeoByPostId(id);
    return sendSuccess(res, 200, 'SEO metadata fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const updateSeo = async (req, res, next) => {
  try {
    validatePostIdParam(req.params);
    validateSeoUpdate(req.body);

    const { id } = req.params;
    const data = await seoService.updateSeo(
      id,
      req.body,
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, 200, 'SEO metadata updated successfully.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSeo, updateSeo };
