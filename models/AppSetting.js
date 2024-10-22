const mongoose = require("mongoose");

// Define the schema for the app settings
const AppSettingSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: "APP GYMS",
    },
    appLogo: {
      type: String,
      default: "",
    },
    banners: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        isUrl: {
          type: Boolean,
          default: false, // Assuming the default is false
        },
      },
    ],
    paddelCommission: {
      type: Number,
      default: 0,
    },  
    weightFitnessCommission: {
      type: Number,
      default: 0,
    }, 
    yogaCommission: {
      type: Number,
      default: 0,
    }, 
    another: { 
      type: Number, 
      default: 0
    },
    yogaTypes: [],
    stopSchedule: {
      start: {
        type: Date,
        default: null,
      },
      end: {
        type: Date,
        default: null,
      },
    },
    isTemporarilyStopped: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  } 

  
);

// Create the model from the schema
const AppSetting = mongoose.model("AppSetting", AppSettingSchema);

module.exports = AppSetting;
