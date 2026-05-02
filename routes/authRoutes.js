const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authController");

router.get("/signup",  ctrl.signupForm);
router.post("/signup", ctrl.signup);
router.get("/login",   ctrl.loginForm);
router.post("/login",  ctrl.login);
router.get("/logout",  ctrl.logout);

// Admin users list
router.get("/admin/users", ctrl.adminUsers);

module.exports = router;
