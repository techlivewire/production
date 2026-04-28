const mongoose = require("mongoose");

const colCardSchema = new mongoose.Schema({
  label: String,
  heading: String,
  description: String,
  images: [String]   // store image path or URL
});

module.exports = mongoose.model("ColCard", colCardSchema);