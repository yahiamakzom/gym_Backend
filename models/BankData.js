const mongoose = require("mongoose");

module.exports = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    bankName: {
      type: String,
    },
    bankAccountName: {
      type: String,
    },
    bankAccountNumber: {
      type: String,
    },
  },
  { timestamps: true }
);
