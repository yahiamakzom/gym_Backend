const mongoose = require("mongoose");

module.exports = mongoose.model(
  "UserSub",
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscriptions",
    },
    start_date: Date,
    end_date: Date,
    isfreezen: {
      type: Boolean,
      default: false, 
    },
    freezenDate: Date ,
    expired: {
      type: Boolean,
      default: false,
    },
    code: Number,
  })
);
