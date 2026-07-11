const eventService = require("../services/eventService");

// GET /editEvent/:id
async function getEditEvent(req, res, next) {
  try {
    const event = await eventService.getEventForEdit(req.tenantId, req.params.id);
    if (!event) return res.send("Event not found");
    res.render("edit", { event });
  } catch (err) {
    next(err);
  }
}

// POST /addEvent
async function postAddEvent(req, res, next) {
  try {
    await eventService.addEvent(req.tenantId, req.body);
    res.redirect("/admin");
  } catch (err) {
    if (err.status === 400) return res.status(400).send(err.message);
    next(err);
  }
}

// POST /updateEvent/:id
async function postUpdateEvent(req, res, next) {
  try {
    await eventService.updateEvent(req.tenantId, req.params.id, req.body);
    res.redirect("/admin");
  } catch (err) {
    next(err);
  }
}

// GET /deleteEvent/:id
async function getDeleteEvent(req, res, next) {
  try {
    await eventService.deleteEvent(req.tenantId, req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEditEvent,
  postAddEvent,
  postUpdateEvent,
  getDeleteEvent,
};
