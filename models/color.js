


const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  primary:   { type: String, default: "#009344" },
  secondary: { type: String, default: "#006635" },
  other:     { type: String, default: "#f6a623" }
});

const colorRepo = mongoose.model("Color", colorSchema);

module.exports = colorRepo;