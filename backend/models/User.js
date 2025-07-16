const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    section: { type: String, enum: ["engineering", "medical"], required: true },
    avatar: String,
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: String,
    phone: String,
    bio: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
