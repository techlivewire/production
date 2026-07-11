/**
 * BaseRepository
 *
 * Wraps a Mongoose model and enforces tenantId on every query.
 * This is the single place that "knows" how tenant scoping works -
 * every other repository extends or instantiates this.
 *
 * Usage:
 *   const eventRepo = new BaseRepository(Event);
 *   eventRepo.findAll(tenantId);
 *   eventRepo.findById(tenantId, eventId);
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // --- Reads ---

  findAll(tenantId, filter = {}) {
    return this.model.find({ tenantId, ...filter });
  }

  findOne(tenantId, filter = {}) {
    return this.model.findOne({ tenantId, ...filter });
  }

  findById(tenantId, id) {
    return this.model.findOne({ _id: id, tenantId });
  }

  count(tenantId, filter = {}) {
    return this.model.countDocuments({ tenantId, ...filter });
  }

  // --- Writes ---

  create(tenantId, data) {
    return this.model.create({ ...data, tenantId });
  }

  updateById(tenantId, id, data) {
    return this.model.findOneAndUpdate(
      { _id: id, tenantId },
      data,
      { new: true }
    );
  }

  deleteById(tenantId, id) {
    return this.model.findOneAndDelete({ _id: id, tenantId });
  }

  // --- Singleton-style documents (color, title, logo, about, etc.) ---
  // These collections typically have ONE document per tenant.

  upsertSingleton(tenantId, data) {
    return this.model.findOneAndUpdate(
      { tenantId },
      data,
      { new: true, upsert: true }
    );
  }
}

module.exports = BaseRepository;
