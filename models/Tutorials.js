const mongoose = require("mongoose");

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  sampleCode: {
    type: String,
    default: "// Sample code",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Tutorial", tutorialSchema);