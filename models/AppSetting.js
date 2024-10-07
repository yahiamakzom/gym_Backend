const mongoose = require("mongoose");

// Define the schema for the bank account
const AppSetting = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: "APP GYMS",
    },
    appLogo: {
      type: String,
      default: "",
    },
    banner: [],
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
    another:{ 
      type: Number, 
      default: 0
    }  ,
    yogaTypes:[]
  },
  {
    timestamps: true,
  }
);

// Create the model from the schema
const appSetting = mongoose.model("AppSetting", AppSetting);

module.exports = appSetting;
