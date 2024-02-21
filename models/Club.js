const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Club",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Please Enter Club Name"],
        trim: true,
      },
      gender: {
        type: String,
        required: [true, "Please Enter Gender"],
        enum: ["male", "female", "both"],
      },
      // days: {
      //     type: String,
      //     required:[true,"please add Days"]
      // },
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      allDay: {
        type: Boolean,
        default: false,
      },
      country: {
        type: String,
        required: [true, "Please Enter country Name"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "Please Enter city Name"],
        trim: true,
      },
      lat: {
        type: String,
        required: [true, "please add club lat"],
      },
      long: {
        type: String,
        required: [true, "please add club long"],
      },
      description: {
        type: String,
        required: [true, "Please Enter Description "],
      },
      sports: Array,
      WorkingDays: Array,
      images: Array,
      location: {
        type: String,
        trim: true,
      },
      logo: String,
      commission: {
        type: Number,
        required: [true, "Please Enter Commmission Of Club"],
      },

      discountCode: {
        type: String,
        default: null,
      },
      discountQuantity: {
        type: Number,
        default: null,
      },
    },
    { timestamps: true }
  )
);
