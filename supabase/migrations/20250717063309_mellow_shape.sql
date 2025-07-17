/*
  # Notes and Test System

  1. New Tables
    - `study_notes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `subject` (text)
      - `section` (enum: engineering, medical)
      - `uploaded_by` (uuid, references profiles)
      - `file_url` (text, optional)
      - `created_at` (timestamp)

    - `mock_tests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `section` (enum: engineering, medical)
      - `subject` (text)
      - `duration` (integer, minutes)
      - `total_marks` (integer)
      - `questions` (jsonb)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)

    - `test_results`
      - `id` (uuid, primary key)
      - `test_id` (uuid, references mock_tests)
      - `user_id` (uuid, references profiles)
      - `score` (integer)
      - `total_questions` (integer)
      - `time_taken` (integer, minutes)
      - `answers` (jsonb)
      - `analytics` (jsonb)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create study notes table
CREATE TABLE IF NOT EXISTS study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  subject text NOT NULL,
  section user_section NOT NULL,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Create mock tests table
CREATE TABLE IF NOT EXISTS mock_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  section user_section NOT NULL,
  subject text NOT NULL,
  duration integer NOT NULL DEFAULT 60,
  total_marks integer NOT NULL DEFAULT 100,
  questions jsonb NOT NULL DEFAULT '[]',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create test results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES mock_tests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  analytics jsonb DEFAULT '{}',
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Study notes policies
CREATE POLICY "Authenticated users can read study notes"
  ON study_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert study notes"
  ON study_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update study notes"
  ON study_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Mock tests policies
CREATE POLICY "Authenticated users can read mock tests"
  ON mock_tests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mock tests"
  ON mock_tests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Test results policies
CREATE POLICY "Users can read own test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own test results"
  ON test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );