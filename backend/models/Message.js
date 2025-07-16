const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    section: {
      type: String,
      enum: ["general", "engineering", "medical"],
      default: "general",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
