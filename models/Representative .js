const mongoose = require("mongoose");

const representativeSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true,"Please Enter Your name"]
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required:[true,"Please Enter Your Email Address "]
    },
    clups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club"
        }
    ] ,
    commission: {
      type: Number,
      default: 0
  } ,
  token: String,

});

module.exports = mongoose.model("Representative", representativeSchema);
