const mongoose = require("mongoose");
const discountSchema = require("../PackageDiscount"); // Import the discount schema

const anotherActivitySchema = new mongoose.Schema(
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
    packageName: {
      type: String,
      required: [true, "Please enter the package name"],
    },
    activityName: {
      type: String,
      required: [true, "Please enter the activity name"],
    },
    packageType: {
      type: String,
      enum: ["daily", "60 minutes", "30 minutes"],
      required: [true, "Please enter the package type"],
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
      availableSeats: {
        type: Number,
        default: function() { return this.numberOfSeats; },
      },
      needsRenewal: {
        type: Boolean,
        default: true, // Mark slot for renewal by default
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
    seetsCount:{ 
      type: Number,
      
    }

  },
  {
    timestamps: true,
  }
);

// Method to check and update seat availability
anotherActivitySchema.methods.bookSlot = async function(slotId, numberOfSeats) {
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
anotherActivitySchema.methods.cancelBooking = async function(slotId, numberOfSeats) {
  const slot = this.availableSlots.id(slotId);
  if (!slot) {
    throw new Error("Slot not found");
  }
  slot.availableSeats += numberOfSeats;
  await this.save();
  return slot;
};

// Method to renew slots (reset availableSeats for the next day)
anotherActivitySchema.methods.renewSlots = async function() {
  this.availableSlots.forEach(slot => {
    if (slot.needsRenewal) {
      slot.availableSeats = slot.numberOfSeats;
      slot.needsRenewal = false; // Reset renewal flag after renewal
    }
  });
  await this.save();
};

module.exports = mongoose.model("AnotherActivityPackage", anotherActivitySchema);
