const mongoose = require("mongoose");
module.exports = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    home_location: String,
    phone: String,
    email: {
      type: String,
      required: [true, "Please Enter Your Email Address "],
    },
    password: {
      type: String,
      min: 6,
      required: [true, "Please Enter Your Password With Minmum length 6"],
    },
    gender: String,
    role: {
      type: String,
      default: "client",
      enum: ["admin", "club", "client" ,"clubManger"],
    },

    code: Number,
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    otp: {
      type: Number,
    },

    wallet: Number,
    token: String,
    photo: String,
    lat: {
      type: String,
      default: "24.7136", // Default latitude value
    },
    long: {
      type: String,
      default: "46.6753", // Default longitude value
    },
    operations: [
      {
        operationKind: {
          type: String,
          enum: ["خصم", "ايداع"],
        },
        operationQuantity: {
          type: Number,
        },
        paymentKind: {
          type: String,
        },
        subscriptionType: {
          type: String,
          default: null,
        },
        clubName: {
          type: String,
          default: null,
        },
      },
    ],
  })
);
