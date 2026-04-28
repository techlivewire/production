const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  title: String,
  description: String,
  images: [String]
});

module.exports = mongoose.model("About", aboutSchema);