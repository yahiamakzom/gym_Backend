// discountSchema.js
const mongoose = require("mongoose");

// Reusable discount schema
const discountSchema = new mongoose.Schema({
  discountForAll: {
    type: Boolean,
    default: false, // Whether the discount applies to all members
  },
  discountFrom: {
    type: Date, // Start date for the discount period
  },
  discountTo: {
    type: Date, // End date for the discount period
  },
  priceAfterDiscount: {
    type: Number, // Price after applying the discount
  },
  discountApplicableToNewMembersOnly: {
    type: Boolean,
    default: false, // True if discount only applies to new members
  },
  discountStopDays: {
    type: Number,
  },
});

module.exports = discountSchema;
