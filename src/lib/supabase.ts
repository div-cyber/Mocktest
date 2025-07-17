import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  section: 'engineering' | 'medical'
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  phone?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface LoginSession {
  id: string
  user_id: string
  login_time: string
  logout_time?: string
  ip_address: string
  user_agent: string
  session_duration?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  message: string
  section: 'general' | 'engineering' | 'medical'
  created_at: string
}

export interface StudyNote {
  id: string
  title: string
  content: string
  subject: string
  section: 'engineering' | 'medical'
  uploaded_by: string
  file_url?: string
  created_at: string
}

export interface MockTest {
  id: string
  title: string
  description: string
  section: 'engineering' | 'medical'
  subject: string
  duration: number
  total_marks: number
  questions: any[]
  created_by: string
  created_at: string
}

export interface TestResult {
  id: string
  test_id: string
  user_id: string
  score: number
  total_questions: number
  time_taken: number
  answers: any
  analytics?: any
  completed_at: string
}