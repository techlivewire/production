const BaseRepository = require("./baseRepository");
const Event = require("../models/Event");

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }

  /**
   * Used by the admin/home pages to show events in chronological order.
   */
  findAllSorted(tenantId, sort = { date: 1 }) {
    return this.model.find({ tenantId }).sort(sort);
  }
}

module.exports = new EventRepository();
