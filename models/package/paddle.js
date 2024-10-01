const mongoose = require("mongoose");
const discountSchema = require("../PackageDiscount"); // Import the discount schema

const paddleSchema = new mongoose.Schema(
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
    sessionDuration: {
      type: String,
      enum: ["30 minutes", "45 minutes", "60 minutes", "90 minutes", "120 minutes"],
      required: [true, "Please enter the session duration"],
    },
    availableSlots: [{
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      numberOfSeats: {
        type: Number,
        required: [true, "Please enter the number of seats"],
        min: 1, // Ensure at least one seat is available
      },
  
    }],
    price: {
      type: Number,
      required: [true, "Please enter the package price"],
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
  type :String
  },
  },
  {
    timestamps: true,
  }
);

// Method to check and update seat availability
paddleSchema.methods.bookSlot = async function(slotId, numberOfSeats) {
  const slot = this.availableSlots.id(slotId);
  if (!slot) {
    throw new Error("Slot not found");
  }
  if (slot.availableSeats < numberOfSeats) {
    throw new Error("Not enough seats available");
  }
  slot.availableSeats -= numberOfSeats;
  await this.save();
  return slot;
};

// Method to cancel booking and free up seats
paddleSchema.methods.cancelBooking = async function(slotId, numberOfSeats) {
  const slot = this.availableSlots.id(slotId);
  if (!slot) {
    throw new Error("Slot not found");
  }
  slot.availableSeats += numberOfSeats;
  await this.save();
  return slot;
};

module.exports = mongoose.model("PaddlePackage", paddleSchema);
