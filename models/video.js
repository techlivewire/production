const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoUrl: String
});

module.exports = mongoose.model("Video", videoSchema);