const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoUrl: String,

  //tenant logic
    tenantId:{
 type: mongoose.Schema.Types.ObjectId,
 ref:"Tenant",
 required:true
}
});

module.exports = mongoose.model("Video", videoSchema);