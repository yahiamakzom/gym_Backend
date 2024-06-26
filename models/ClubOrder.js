const mongoose = require("mongoose");
const Bank = require("./BankData");
module.exports = mongoose.model(
  "orders",
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
      
      mapUrl: {
        type: String,
        default:
          "https://www.google.com/maps/@24.7207538,46.4222781,9.96z?entry=ttu",
      },

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
      email: {
        type: String,
        required: [true, "Please Enter Your Email Address "],
      },
      password: {
        type: String,
        min: 6,
        required: [true, "Please Enter Your Password With Minmum length 6"],
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

    
      isWork: {
        type: Boolean,
        default: true,
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




    },

    { timestamps: true }
  )
);
