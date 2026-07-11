const express = require("express");
const router = express.Router();

const requireTenant = require("../middleware/requireTenant");
const eventController = require("../controllers/eventController");

router.get("/editEvent/:id", requireTenant, eventController.getEditEvent);
router.post("/addEvent", requireTenant, eventController.postAddEvent);
router.post("/updateEvent/:id", requireTenant, eventController.postUpdateEvent);
router.get("/deleteEvent/:id", requireTenant, eventController.getDeleteEvent);

module.exports = router;
