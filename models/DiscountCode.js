const mongoose = require('mongoose');
const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  validFrom: {
    type: Date,
    default: Date.now, 
  },
  validTo: {
    type: Date,
    default: null, // Optional, defaults to null
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true, 
  }
}, {
  timestamps: true,
});

// Middleware to delete expired discount codes
discountCodeSchema.pre('save', async function (next) {
  const currentDate = new Date();
  if (this.validTo && this.validTo <= currentDate) {

  console.log(this)
  }
  next();
});


discountCodeSchema.methods.deleteIfExpired = async function () {
  const currentDate = new Date();
  if (this.validTo && this.validTo <= currentDate) {
    await this.remove();
    return true;
  }
  return false;
};

// Static method to delete all expired discount codes
discountCodeSchema.statics.deleteExpiredDiscounts = async function () {
  const currentDate = new Date();
  const results = await this.find({ validTo: { $lte: currentDate, $exists: true, $ne: null } });
  

  const deletionResults = await Promise.all(results.map(async (doc) => await doc.deleteIfExpired()));

  return {
    deletedCount: deletionResults.filter(result => result).length
  };
};

const DiscountCode = mongoose.model('DiscountCode', discountCodeSchema);

module.exports = DiscountCode;
