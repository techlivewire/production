const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  title: String,
  description: String,
  images: [String],

  //tenant logic
    tenantId:{
 type: mongoose.Schema.Types.ObjectId,
 ref:"Tenant",
 required:true
}
});

module.exports = mongoose.model("About", aboutSchema);