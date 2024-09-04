// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }, 
  club:{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true
  }
});

// Hash password before saving the user
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// Define a method to compare password hashes
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// Create the User model
const User = mongoose.model("ClubUser", userSchema);

module.exports = User;
