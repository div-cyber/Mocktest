const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

// Get all messages (optionally filter by section)
router.get("/", auth, async (req, res) => {
  try {
    const section = req.query.section;
    const filter = section && section !== "general" ? { section } : {};
    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message
router.post("/", auth, async (req, res) => {
  try {
    const { message, section } = req.body;
    const userId = req.user.id;
    const userName = req.user.name || "User";
    const newMessage = new Message({ userId, userName, message, section });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
