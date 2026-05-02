const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  // logoMark: String,
  image: String,
  logoTextTop: String,
  logoTextBottom: String,

  //tenant logic
    tenantId:{
 type: mongoose.Schema.Types.ObjectId,
 ref:"Tenant",
 required:true
}
});

module.exports = mongoose.model("Logo", logoSchema);