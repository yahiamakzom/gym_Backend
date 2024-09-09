const mongoose = require('mongoose');

// Define the schema for the accepted transfer
const transferSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  pdf: {
    type: String,
    default: null,
  },
  refusedReason: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["accepted", "rejected"], // Enum should be an array of strings
    required: true,
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club', // Reference to the Club model
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the model from the schema
const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;
