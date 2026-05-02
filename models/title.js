const mongoose = require("mongoose");

const titleSchema = new mongoose.Schema({
  title: String,
  subTitle: String,
  heroEyebrow: String,
  heroUrl: String,
  heroUrlText : String,

  //tenant logic
    tenantId:{
 type: mongoose.Schema.Types.ObjectId,
 ref:"Tenant",
 required:true
}
});

module.exports = mongoose.model("Title", titleSchema);