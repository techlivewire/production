// const express = require("express");
// const router = express.Router();
// const upload = require("../config/multer");
// const libraryController = require("../controllers/libraryController");

// // ─── User-facing routes ───────────────────────────────────────────────────────
// router.get("/library", libraryController.listItems);
// router.get("/library/:id", libraryController.viewItem);
// router.get("/library/:id/file", libraryController.serveFile);
// router.get("/library/:id/download", libraryController.downloadItem);

// // ─── Admin routes ─────────────────────────────────────────────────────────────
// router.get("/admin/library", libraryController.adminList);
// router.get("/admin/library/add", libraryController.adminAddForm);
// router.post("/admin/library/add", upload.single("file"), libraryController.adminAdd);
// router.get("/admin/library/edit/:id", libraryController.adminEditForm);
// router.post("/admin/library/edit/:id", upload.single("file"), libraryController.adminEdit);
// router.post("/admin/library/delete/:id", libraryController.adminDelete);


// module.exports = router;
