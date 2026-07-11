
/**
 * Global middleware: resolves the tenant from the hostname and attaches
 * it to the request. Does NOT 404 - some routes (e.g. /health) must work
 * even with no matching tenant. Use requireTenant.js on routes that need
 * to enforce tenant existence.
 */
const Tenant = require("../models/Tenant");

async function tenantResolver(req, res, next) {
  try {
    let host = req.hostname.toLowerCase();

    if (host.startsWith("www.")) {
      host = host.replace("www.", "");
    }

    host = host.replace(/\/$/, "");

    req.tenant = await Tenant.findOne({ domain: host });
    req.tenantId = req.tenant ? req.tenant._id : null;
        console.log("Resolved host:", host, "-> tenant found:", !!req.tenant);

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = tenantResolver;
