const express = require("express");
const router = express.Router();

const requireTenant = require("../middleware/requireTenant");
const siteController = require("../controllers/siteController");

router.get("/", requireTenant, siteController.getHome);

module.exports = router;
