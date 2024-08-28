const mongoose = require("mongoose");

const clubHoursSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "both"],
    required: true
  },
  openTime: {
    type: Date,
    required: true
  },
  closeTime: {
    type: Date,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ClubHours', clubHoursSchema);
