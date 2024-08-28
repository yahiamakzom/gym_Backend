const mongoose = require('mongoose');

// Define the schema for the bank account
const bankAccountSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of the string
  },
  iban: {
    type: String,
    required: true,
    unique: true, // IBANs are unique identifiers for bank accounts
    trim: true,
    match: /^[A-Z0-9]+$/, // Basic regex to ensure IBAN format (letters and digits only)
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create the model from the schema
const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
