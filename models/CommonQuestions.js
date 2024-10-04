const mongoose = require("mongoose");
const CommonQuestions = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const commonQuestions = mongoose.model("CommonQuestions", CommonQuestions);

module.exports = commonQuestions;
