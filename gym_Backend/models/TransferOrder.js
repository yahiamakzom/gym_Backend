const mongoose = require('mongoose');

// Define the schema for the original transfer order
const transferOrderSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0, // Ensure the amount is non-negative
  },
  transferCause: {
    type: String,
    required: true,
    trim: true, // Description of the transfer reason
  },
  iban: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true, // Name of the bank account owner
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club', // Reference to the Club model
    required: true,
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the model from the schema
const TransferOrder = mongoose.model('TransferOrder', transferOrderSchema);

module.exports = TransferOrder;
