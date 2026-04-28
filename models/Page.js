const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // "privacy", "terms"
  content: { type: String, required: true },

  //tenant logic 
    tenantId:{
 type: mongoose.Schema.Types.ObjectId,
 ref:"Tenant",
 required:true
}
});

module.exports = mongoose.model("Page", pageSchema);