const mongoose = require("mongoose");

const titleSchema = new mongoose.Schema({
  title: String,
  subTitle: String,
  heroEyebrow: String,
  heroUrl: String
});

module.exports = mongoose.model("Title", titleSchema);