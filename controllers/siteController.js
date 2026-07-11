const siteService = require("../services/siteService");

/**
 * GET /
 * Controller only orchestrates: pull tenantId from req (set by
 * requireTenant middleware), delegate to service, render view.
 */
async function getHome(req, res, next) {
  try {
    const data = await siteService.getHomePageData(req.tenantId);
    res.render("index", data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getHome };
