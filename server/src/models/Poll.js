import mongooose from "mongoose";

// Option Schema
const optionSchema = new mongooose.Schema({
  text: { type: String, required: true },
});

// Question Schema
const questionSchema = new mongooose.Schema({
  question: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [optionSchema],
});

// Poll Schema
const pollSchema = new mongooose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    creator: { type: mongooose.Schema.Types.ObjectId, ref: "User" },
    allowAnonymous: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
    resultsPublishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Poll = mongooose.model("Poll", pollSchema);

export default Poll;
