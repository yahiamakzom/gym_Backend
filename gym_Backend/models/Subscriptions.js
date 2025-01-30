const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Subscriptions",
  new mongoose.Schema(
    {
      club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
      name: {
        type: String,
        required: [true, "Enter Subscription Name"],
      },
      freezeTime: {
        type: Number,
      },
      freezeCountTime: {
        type: Number,
      },
      price: {
        type: Number,
        required: [true, "Enter Subscription Name"],
      },
      type: {
        type: String,
        enum: [
          "ساعه",
          "سنوي",
          "شهري",
          "اسبوعي",
          "يومي",
          "60Minutes",
          "30Minutes",
          "90Minutes",
          "120Minutes",
        ],
        required: [true, "Please Add a Subscription Date"],
      },
      numberType: {
        type: Number,
        default: 0,
        required: [true, "Enter Subscription number for sepcicfic volumn type"],
      },
      gymsCount: {
        type: Number,
        default: 0,
      },
      gymsCountFixed: {
        type: Number,
        default: 0,
      },
      startData: Date,
      endData: Date,
    },
    { timestamps: true }
  )
);
