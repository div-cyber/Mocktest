/*
  # Add AI Notes System

  1. New Tables
    - `ai_notes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `topic` (text)
      - `content` (text)
      - `section` (user_section)
      - `subject` (text)
      - `generated_by` (uuid, references profiles)
      - `is_ai_generated` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_notes` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS ai_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL,
  content text NOT NULL,
  section user_section NOT NULL,
  subject text NOT NULL,
  generated_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_ai_generated boolean DEFAULT false,
  difficulty text DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read ai notes"
  ON ai_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ai notes"
  ON ai_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create ai notes"
  ON ai_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (generated_by = auth.uid());