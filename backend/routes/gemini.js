const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Helper: Prompt engineering for MCQ generation
function buildGeminiPrompt({ section, text, difficulty }) {
  let examType =
    section === "engineering"
      ? "IOE entrance exam of Nepal"
      : "MOE entrance exam of Nepal";
  return (
    `You are an expert question setter for the ${examType}. Given the following content, generate a set of multiple-choice questions (MCQs) with 4 options each, only one correct answer, and explanations. The questions should be at a ${difficulty} level. Format the output as a JSON array with fields: question, options, correctAnswer (index), explanation.` +
    `\nContent:\n${text}`
  );
}

// Helper: Get subject schemes for IOE and MOE
/**
 * @typedef {'engineering'|'medical'} ExamType
 */
const testSchemes = {
  engineering: [
    { subject: "Mathematics", marks: 50 },
    { subject: "Physics", marks: 30 },
    { subject: "Chemistry", marks: 30 },
    { subject: "English", marks: 10 },
  ],
  medical: [
    { subject: "Biology", marks: 80 },
    { subject: "Physics", marks: 50 },
    { subject: "Chemistry", marks: 50 },
    { subject: "MAT", marks: 20 },
  ],
};

// Helper: Build prompt for a subject
function buildSubjectPrompt({ examType, subject, marks, difficulty }) {
  let examName =
    examType === "engineering"
      ? "IOE entrance exam of Nepal"
      : "MOE entrance exam of Nepal";
  return `You are an expert question setter for the ${examName}. Generate ${marks} marks worth of multiple-choice questions (MCQs) for ${subject}. Each question should have 4 options, only one correct answer, and an explanation. Format the output as a JSON array with fields: question, options, correctAnswer (index), explanation. The questions should be at a ${difficulty} level.`;
}

// POST /api/gemini/generate-mcqs
// Accepts text or file, section, and difficulty
router.post("/generate-mcqs", upload.single("file"), async (req, res) => {
  try {
    const { section = "engineering", difficulty = "medium", text } = req.body;
    let content = text;
    if (req.file) {
      content = fs.readFileSync(
        path.join(__dirname, "../uploads", req.file.filename),
        "utf-8"
      );
    }
    if (!content)
      return res.status(400).json({ message: "No content provided" });
    const prompt = buildGeminiPrompt({ section, text: content, difficulty });
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );
    // Parse Gemini's response
    const mcqs =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ mcqs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gemini/feedback
// Accepts user answers and returns feedback
router.post("/feedback", async (req, res) => {
  try {
    const { answers, section } = req.body;
    const prompt = `You are an expert evaluator for the ${
      section === "engineering" ? "IOE" : "MOE"
    } exam of Nepal. Given the following user answers, provide detailed feedback and suggestions for improvement.\n${JSON.stringify(
      answers
    )}`;
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );
    const feedback =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gemini/adaptive-level
// Accepts user performance and returns next difficulty
router.post("/adaptive-level", async (req, res) => {
  try {
    const { correctCount, timeTaken, totalQuestions } = req.body;
    // Simple adaptive logic: if 7+ correct and fast, increase difficulty
    let difficulty = "medium";
    if (correctCount >= 7 && timeTaken < totalQuestions * 30)
      difficulty = "hard";
    else if (correctCount <= 3) difficulty = "easy";
    res.json({ nextDifficulty: difficulty });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gemini/generate-test
// Body: { examType: 'engineering' | 'medical', difficulty?: 'easy' | 'medium' | 'hard' }
router.post("/generate-test", async (req, res) => {
  try {
    const { examType = "engineering", difficulty = "medium" } = req.body;
    const scheme = testSchemes[examType];
    if (!scheme) return res.status(400).json({ message: "Invalid exam type" });
    const testPaper = { examType, subjects: [] };
    for (const { subject, marks } of scheme) {
      const prompt = buildSubjectPrompt({
        examType,
        subject,
        marks,
        difficulty,
      });
      const geminiRes = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      let questions = [];
      try {
        questions = JSON.parse(
          geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
        );
      } catch {
        questions =
          geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || [];
      }
      testPaper.subjects.push({ subject, marks, questions });
    }
    res.json(testPaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
