// weightFitnessSchema.js
const mongoose = require("mongoose");
const discountSchema = require("../PackageDiscount"); // Import the discount schema

// Weight and Fitness package schema
const weightFitnessSchema = new mongoose.Schema(
  {
    commission:{ 
      type: Number, 
      default: 0
    } ,
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    sportType: {
      type: String,
      enum: ["weight", "boxing"],
      default: "weight",
    },
    packageName: {
      type: String,
      required: [true, "Please enter the package name"],
    },
    packageType: {
      type: String,
      enum: ["monthly", "yearly", "weekly", "daily"],
      required: [true, "Please select the package type"],
    },
    price: {
      type: Number,
      required: [true, "Please enter the package price"],
    },
    discount: {
      type: discountSchema, // Embed the reusable discount schema
      default: {},
    },
    description: {
      type: String,
      default: "",
    },
    freezeTime: {
      type: Number,
    },
    freezeCountTime: {
      type: Number,
    },
    superadminId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WeightFitnessPackage", weightFitnessSchema);
