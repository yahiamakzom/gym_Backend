const mongoose = require("mongoose");
const discountSchema = require("../PackageDiscount"); // Import the discount schema

// Session schema for handling multiple sessions per day
const sessionSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, "Start time is required"],
  },
  endTime: {
    type: String,
    required: [true, "End time is required"],
  },
});

const yogaSchema = new mongoose.Schema(
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
    yogaType: {
      type: String,
      required: [true, "Please enter the type of yoga"],
    },
    daysOfWeek: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: [true, "Please enter the days of the week for sessions"],
    },
    sessionsPerDay: [sessionSchema], // Array of session objects
    price: {
      type: Number,
      required: [true, "Please enter the package price"],
    },
    numberOfSeats: {
      type: Number,
      required: [true, "Please enter the number of seats"],
      min: 1, // Ensure at least one seat is available
    },
    discount: {
      type: discountSchema, // Embed the reusable discount schema
      default: {}, // Default to an empty object if not provided
    },
    description: {
      type: String,
      default: "",
    },
    superadminId: {
type:String
  },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("YogaPackage", yogaSchema);
