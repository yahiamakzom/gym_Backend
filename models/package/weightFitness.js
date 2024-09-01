// weightFitnessSchema.js
const mongoose = require("mongoose");
const discountSchema = require("../PackageDiscount"); // Import the discount schema

// Weight and Fitness package schema
const weightFitnessSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WeightFitnessPackage", weightFitnessSchema);
