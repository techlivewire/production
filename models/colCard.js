const mongoose = require("mongoose");

const colCardSchema = new mongoose.Schema({
  label: String,
  heading: String,
  description: String,
  images: [String] ,  // store image path or URL

  //tenant logic
    tenantId:{
 type: mongoose.Schema.Types.ObjectId,
 ref:"Tenant",
 required:true
}
});

module.exports = mongoose.model("ColCard", colCardSchema);