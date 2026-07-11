/**
 * Route-level guard. Apply to any route that must NOT proceed
 * without a valid tenant. Replaces the repeated:
 *
 *   if (!req.tenant) return res.status(404).render("tenant-not-found");
 *
 * that was duplicated across server.js.
 *
 * Must run AFTER tenantResolver (which sets req.tenant / req.tenantId).
 */
function requireTenant(req, res, next) {
  if (!req.tenant) {
    return res.status(404).render("tenant-not-found");
  }
  next();
}

module.exports = requireTenant;
