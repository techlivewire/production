// const express = require("express");
// const router  = express.Router();
// const upload  = require("../config/multer");
// const ctrl    = require("../controllers/eLibraryController");

// // ── Public ────────────────────────────────────────────────────────────────────
// router.get("/elibrary",              ctrl.searchPage);
// router.get("/elibrary/:id",          ctrl.viewItem);
// router.get("/elibrary/:id/file",     ctrl.serveFile);
// router.get("/elibrary/:id/download", ctrl.downloadItem);

// // ── Admin ─────────────────────────────────────────────────────────────────────
// router.get("/admin/elibrary",                    ctrl.adminList);
// router.get("/admin/elibrary/add",                ctrl.adminAddForm);
// router.post("/admin/elibrary/add",               upload.single("file"), ctrl.adminAdd);
// router.get("/admin/elibrary/edit/:id",           ctrl.adminEditForm);
// router.post("/admin/elibrary/edit/:id",          upload.single("file"), ctrl.adminEdit);
// router.post("/admin/elibrary/delete/:id",        ctrl.adminDelete);

// module.exports = router;



const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const upload  = require("../config/multer");
const ctrl    = require("../controllers/eLibraryController");

// Separate multer for Excel+ZIP import (temp storage)
const importUpload = multer({ dest: "temp/" });

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/elibrary",              ctrl.searchPage);
router.get("/elibrary/:id",          ctrl.viewItem);
router.get("/elibrary/:id/file",     ctrl.serveFile);
router.get("/elibrary/:id/download", ctrl.downloadItem);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/elibrary",         ctrl.adminList);
router.get("/admin/elibrary/import",  ctrl.adminImportForm);
router.post("/admin/elibrary/import", importUpload.fields([
  { name: "excel", maxCount: 1 },
  { name: "zip",   maxCount: 1 }
]), ctrl.adminImport);
router.get("/admin/elibrary/add",                ctrl.adminAddForm);
router.post("/admin/elibrary/add",               upload.single("file"), ctrl.adminAdd);
router.get("/admin/elibrary/edit/:id",           ctrl.adminEditForm);
router.post("/admin/elibrary/edit/:id",          upload.single("file"), ctrl.adminEdit);
router.post("/admin/elibrary/delete/:id",        ctrl.adminDelete);

module.exports = router;