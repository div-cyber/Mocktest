/*
  # Chat System

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `user_name` (text)
      - `message` (text)
      - `section` (enum: general, engineering, medical)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TYPE chat_section AS ENUM ('general', 'engineering', 'medical');

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  message text NOT NULL,
  section chat_section DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Authenticated users can read chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chat messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());