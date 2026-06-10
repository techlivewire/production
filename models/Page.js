const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  content:  { type: String, default: "" },
  structuredContent: {
    pageTitle:   { type: String, default: "" },
    lastUpdated: { type: String, default: "" },
    sections: [
      {
        heading: { type: String },
        points:  [{ type: String }],
      }
    ]
  }
}, { timestamps: true });

// Compound unique index — same name allowed for different tenants
pageSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Page", pageSchema);