const mongoose = require("mongoose");

const Activities = new mongoose.Schema({

sportName:{
  type: String
}


});

module.exports = mongoose.model("Activities", Activities);
