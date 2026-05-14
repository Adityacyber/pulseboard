import mongoose from "mongoose";

// Answer Schema
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },

  selectedOption: {
    type: String,
    required: true,
  },
});

// Response Schema
const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    answers: [answerSchema],
  },
  {
    timestamps: true,
  },
);

const Response = mongoose.model("Response", responseSchema);

export default Response;
