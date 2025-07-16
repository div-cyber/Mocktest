import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  section: 'engineering' | 'medical';
  uploadedBy: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  section: 'engineering' | 'medical';
  subject: string;
  duration: number; // in minutes
  questions: Question[];
  totalMarks: number;
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in minutes
  completedAt: string;
  answers: { questionId: string; selectedAnswer: number }[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  section: 'engineering' | 'medical' | 'general';
}

interface AppContextType {
  notes: Note[];
  mockTests: MockTest[];
  testResults: TestResult[];
  chatMessages: ChatMessage[];
  addNote: (note: Omit<Note, 'id'>) => void;
  addMockTest: (test: Omit<MockTest, 'id'>) => void;
  submitTestResult: (result: Omit<TestResult, 'id'>) => void;
  sendMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  fetchMessages: (section?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:5000/api';

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Fetch chat messages from backend
  const fetchMessages = async (section?: string) => {
    try {
      const token = localStorage.getItem('token');
      const params = section && section !== 'general' ? { section } : {};
      const res = await axios.get(`${API_URL}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setChatMessages(res.data);
    } catch (err) {
      setChatMessages([]);
    }
  };

  // Send a chat message to backend
  const sendMessage = async (message: Omit<ChatMessage, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/chat`, message, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(prev => [...prev, res.data]);
    } catch (err) {
      // Optionally handle error
    }
  };

  // (Other state and functions remain unchanged)
  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString()
    };
    setNotes(prev => [...prev, newNote]);
  };

  const addMockTest = (test: Omit<MockTest, 'id'>) => {
    const newTest: MockTest = {
      ...test,
      id: Date.now().toString()
    };
    setMockTests(prev => [...prev, newTest]);
  };

  const submitTestResult = (result: Omit<TestResult, 'id'>) => {
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString()
    };
    setTestResults(prev => [...prev, newResult]);
  };

  return (
    <AppContext.Provider value={{
      notes,
      mockTests,
      testResults,
      chatMessages,
      addNote,
      addMockTest,
      submitTestResult,
      sendMessage,
      fetchMessages
    }}>
      {children}
    </AppContext.Provider>
  );
};