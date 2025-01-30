const mongoose = require("mongoose");

const Support = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    couse: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("support", Support);
