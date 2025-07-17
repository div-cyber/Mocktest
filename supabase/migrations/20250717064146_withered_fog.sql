/*
  # Enhance Test System for Adaptive Testing

  1. Table Updates
    - Add adaptive testing fields to mock_tests
    - Add performance tracking to test_results
    - Add question difficulty tracking

  2. New Tables
    - `question_analytics` for tracking question performance
    - `user_performance` for adaptive algorithm data
*/

-- Add adaptive fields to mock_tests
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS is_adaptive boolean DEFAULT false;
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS base_difficulty text DEFAULT 'medium';
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS time_limit integer DEFAULT 3600; -- seconds

-- Add performance tracking to test_results
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS difficulty_progression jsonb DEFAULT '{}';
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS question_timings jsonb DEFAULT '{}';
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS adaptive_score numeric DEFAULT 0;

-- Question analytics table
CREATE TABLE IF NOT EXISTS question_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL,
  time_taken integer NOT NULL, -- seconds
  difficulty text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own question analytics"
  ON question_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own question analytics"
  ON question_analytics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all question analytics"
  ON question_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- User performance tracking
CREATE TABLE IF NOT EXISTS user_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  difficulty text NOT NULL,
  accuracy_rate numeric DEFAULT 0,
  average_time numeric DEFAULT 0,
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, subject, difficulty)
);

ALTER TABLE user_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own performance"
  ON user_performance
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage user performance"
  ON user_performance
  FOR ALL
  TO authenticated
  USING (true);