import axios from 'axios';

const API_URL = 'http://localhost:5000/api/gemini';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SubjectMCQSet {
  subject: string;
  marks: number;
  questions: MCQ[];
}

export interface TestPaper {
  examType: 'engineering' | 'medical';
  subjects: SubjectMCQSet[];
}

export async function generateMCQs({
  text,
  file,
  section = 'engineering',
  difficulty = 'medium',
}: {
  text?: string;
  file?: File;
  section?: 'engineering' | 'medical';
  difficulty?: 'easy' | 'medium' | 'hard';
}): Promise<MCQ[] | string> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);
  formData.append('section', section);
  formData.append('difficulty', difficulty);
  const res = await axios.post(`${API_URL}/generate-mcqs`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  try {
    return JSON.parse(res.data.mcqs);
  } catch {
    return res.data.mcqs;
  }
}

export async function getFeedback({
  answers,
  section = 'engineering',
  score,
  timeTaken,
  totalQuestions
}: {
  answers: any;
  section?: 'engineering' | 'medical';
  score?: number;
  timeTaken?: number;
  totalQuestions?: number;
}): Promise<string> {
  const token = localStorage.getItem('token');
  // Combine answers, score, timing for Gemini feedback
  const payload = { answers, section, score, timeTaken, totalQuestions };
  const res = await axios.post(`${API_URL}/feedback`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.feedback;
}

export async function getAdaptiveLevel({
  correctCount,
  timeTaken,
  totalQuestions
}: {
  correctCount: number;
  timeTaken: number;
  totalQuestions: number;
}): Promise<'easy' | 'medium' | 'hard'> {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/adaptive-level`, {
    correctCount,
    timeTaken,
    totalQuestions
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.nextDifficulty;
}

export async function generateTestPaper({
  examType,
  difficulty = 'medium',
}: {
  examType: 'engineering' | 'medical';
  difficulty?: 'easy' | 'medium' | 'hard';
}): Promise<TestPaper> {
  const token = localStorage.getItem('token');
  const res = await axios.post(
    `${API_URL}/generate-test`,
    { examType, difficulty },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
} 