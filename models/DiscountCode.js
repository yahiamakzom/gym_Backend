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

    await this.remove();
  }
  next();
});


discountCodeSchema.statics.deleteExpiredDiscounts = async function () {
  const currentDate = new Date();
  await this.deleteMany({ validTo: { $lte: currentDate } });
};

const DiscountCode = mongoose.model('DiscountCode', discountCodeSchema);

module.exports = DiscountCode;
