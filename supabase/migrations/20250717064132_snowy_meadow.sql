/*
  # Add authorized emails system

  1. New Tables
    - `authorized_emails`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `authorized_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `authorized_emails` table
    - Add policy for admins to manage authorized emails
*/

CREATE TABLE IF NOT EXISTS authorized_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  authorized_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE authorized_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage authorized emails"
  ON authorized_emails
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert some default authorized emails
INSERT INTO authorized_emails (email, is_active) VALUES
  ('admin@engineering.com', true),
  ('admin@medical.com', true),
  ('student@engineering.com', true),
  ('student@medical.com', true)
ON CONFLICT (email) DO NOTHING;