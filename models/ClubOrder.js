const mongoose = require("mongoose");
const Bank = require("./BankData");
module.exports = mongoose.model(
  "orders",
  new mongoose.Schema(
    {
      email: {
        type: String,

      },
      password: {
        type: String,

      
      },
      type: {
        type: String,
        default: "superadmin",
        enum: ["admin", "superadmin"],
      },
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
      isAddClubs: {
        type: Boolean,
        default: false,
      },
      country: {
        type: String,
        required: [true, "Please Enter country Name"],
        trim: true,
      },
      status: {
        type: String,
        default: "pending",
        enum: ["pending", "refused"],
      },
      city: {
        type: String,
        required: [true, "Please Enter city Name"],
        trim: true,
      },

      clubMemberCode: {
        type: String,
        // unique: true,
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
    },

    { timestamps: true }
  )
);
