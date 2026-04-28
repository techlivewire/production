const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  logoMark: String,
  logoTextTop: String,
  logoTextBottom: String
});

module.exports = mongoose.model("Logo", logoSchema);