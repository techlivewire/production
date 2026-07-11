const eventRepo = require("../repositories/eventRepository");

function listEvents(tenantId) {
  return eventRepo.findAllSorted(tenantId);
}

function getEventForEdit(tenantId, eventId) {
  return eventRepo.findById(tenantId, eventId);
}

function addEvent(tenantId, data) {
  const { title, artists, date, time, location } = data;

  if (!title || !artists || !date || !time || !location) {
    const err = new Error("All fields required");
    err.status = 400;
    throw err;
  }

  return eventRepo.create(tenantId, { title, artists, date, time, location });
}

function updateEvent(tenantId, eventId, data) {
  const { title, artists, date, time, location } = data;
  return eventRepo.updateById(tenantId, eventId, {
    title,
    artists,
    date,
    time,
    location,
  });
}

function deleteEvent(tenantId, eventId) {
  return eventRepo.deleteById(tenantId, eventId);
}

module.exports = {
  listEvents,
  getEventForEdit,
  addEvent,
  updateEvent,
  deleteEvent,
};
