import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { StudyNote, MockTest, TestResult, ChatMessage } from '../lib/supabase';

export type Note = StudyNote;
export type { MockTest, TestResult, ChatMessage };

interface AppContextType {
  notes: StudyNote[];
  mockTests: MockTest[];
  testResults: TestResult[];
  chatMessages: ChatMessage[];
  loading: boolean;
  addNote: (note: Omit<StudyNote, 'id' | 'created_at'>) => Promise<boolean>;
  addMockTest: (test: Omit<MockTest, 'id' | 'created_at'>) => Promise<boolean>;
  submitTestResult: (result: Omit<TestResult, 'id' | 'completed_at'>) => Promise<boolean>;
  sendMessage: (message: Omit<ChatMessage, 'id' | 'created_at'>) => Promise<void>;
  fetchMessages: (section?: string) => Promise<void>;
  fetchNotes: (section?: string) => Promise<void>;
  fetchMockTests: (section?: string) => Promise<void>;
  fetchTestResults: (userId?: string) => Promise<void>;
  generateQuestions: (params: {
    pdfUrl?: string;
    text?: string;
    section: 'engineering' | 'medical';
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
    subject?: string;
  }) => Promise<any[]>;
  generateAnalytics: (params: {
    testId: string;
    userId: string;
    answers: any[];
    totalScore: number;
    totalQuestions: number;
    timeTaken: number;
    section: 'engineering' | 'medical';
    subject?: string;
  }) => Promise<any>;
  generateAITest: (params: {
    examType: 'engineering' | 'medical';
    difficulty: 'easy' | 'medium' | 'hard';
    driveLink?: string;
    adaptiveLevel?: number;
  }) => Promise<any>;
  generateAINotes: (params: {
    topic: string;
    subject: string;
    section: 'engineering' | 'medical';
    difficulty: 'easy' | 'medium' | 'hard';
    length: 'short' | 'medium' | 'detailed';
    userId: string;
  }) => Promise<any>;
  fetchAINotes: (section?: string) => Promise<void>;
  aiNotes: any[];
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


export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiNotes, setAINotes] = useState<any[]>([]);

  // Fetch chat messages from Supabase
  const fetchMessages = async (section?: string) => {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (section && section !== 'general') {
        query = query.eq('section', section);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatMessages([]);
    }
  };

  // Send a chat message to Supabase
  const sendMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setChatMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Fetch study notes
  const fetchNotes = async (section?: string) => {
    try {
      let query = supabase
        .from('study_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  // Add a new note
  const addNote = async (note: Omit<StudyNote, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('study_notes')
        .insert(note)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setNotes(prev => [data, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  };

  // Fetch mock tests
  const fetchMockTests = async (section?: string) => {
    try {
      let query = supabase
        .from('mock_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMockTests(data || []);
    } catch (error) {
      console.error('Error fetching mock tests:', error);
      setMockTests([]);
    }
  };

  // Add a new mock test
  const addMockTest = async (test: Omit<MockTest, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .insert(test)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMockTests(prev => [data, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding mock test:', error);
      return false;
    }
  };

  // Fetch test results
  const fetchTestResults = async (userId?: string) => {
    try {
      let query = supabase
        .from('test_results')
        .select('*')
        .order('completed_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTestResults(data || []);
    } catch (error) {
      console.error('Error fetching test results:', error);
      setTestResults([]);
    }
  };

  // Submit test result
  const submitTestResult = async (result: Omit<TestResult, 'id' | 'completed_at'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert(result)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTestResults(prev => [data, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting test result:', error);
      return false;
    }
  };

  // Generate questions using Gemini
  const generateQuestions = async (params: {
    pdfUrl?: string;
    text?: string;
    section: 'engineering' | 'medical';
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
    subject?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-questions', {
        body: params
      });

      if (error) throw error;
      return data.questions || [];
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  };

  // Generate analytics using Gemini
  const generateAnalytics = async (params: {
    testId: string;
    userId: string;
    answers: any[];
    totalScore: number;
    totalQuestions: number;
    timeTaken: number;
    section: 'engineering' | 'medical';
    subject?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-analytics', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  };

  // Generate AI test using enhanced Gemini
  const generateAITest = async (params: {
    examType: 'engineering' | 'medical';
    difficulty: 'easy' | 'medium' | 'hard';
    driveLink?: string;
    adaptiveLevel?: number;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ioe-medical', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating AI test:', error);
      throw error;
    }
  };

  // Generate AI notes
  const generateAINotes = async (params: {
    topic: string;
    subject: string;
    section: 'engineering' | 'medical';
    difficulty: 'easy' | 'medium' | 'hard';
    length: 'short' | 'medium' | 'detailed';
    userId: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai-notes', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating AI notes:', error);
      throw error;
    }
  };

  // Fetch AI notes
  const fetchAINotes = async (section?: string) => {
    try {
      let query = supabase
        .from('ai_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setAINotes(data || []);
    } catch (error) {
      console.error('Error fetching AI notes:', error);
      setAINotes([]);
    }
  };

  return (
    <AppContext.Provider value={{
      notes,
      mockTests,
      testResults,
      chatMessages,
      aiNotes,
      loading,
      addNote,
      addMockTest,
      submitTestResult,
      sendMessage,
      fetchMessages,
      fetchNotes,
      fetchMockTests,
      fetchTestResults,
      generateQuestions,
      generateAnalytics,
      generateAITest,
      generateAINotes,
      fetchAINotes
    }}>
      {children}
    </AppContext.Provider>
  );
};