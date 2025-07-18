/*
  # Add Chapter-wise Test System

  1. New Tables
    - `chapters` - Store chapter information for each section
    - `chapter_tests` - Store chapter-specific tests
    - `chapter_questions` - Store questions organized by chapters
  
  2. Updates
    - Add chapter_id to existing tables
    - Add timing configurations
  
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  section user_section NOT NULL,
  subject text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chapter_tests table
CREATE TABLE IF NOT EXISTS chapter_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  duration integer DEFAULT 10800, -- 3 hours in seconds
  total_marks integer DEFAULT 100,
  difficulty text DEFAULT 'medium',
  questions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chapter_questions table for better organization
CREATE TABLE IF NOT EXISTS chapter_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  difficulty text DEFAULT 'medium',
  marks integer DEFAULT 1,
  time_limit integer DEFAULT 90, -- 90 seconds per question
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_questions ENABLE ROW LEVEL SECURITY;

-- Policies for chapters
CREATE POLICY "Everyone can read chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage chapters"
  ON chapters FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Policies for chapter_tests
CREATE POLICY "Everyone can read chapter tests"
  ON chapter_tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage chapter tests"
  ON chapter_tests FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Policies for chapter_questions
CREATE POLICY "Everyone can read chapter questions"
  ON chapter_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage chapter questions"
  ON chapter_questions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert default chapters for Engineering
INSERT INTO chapters (name, description, section, subject, order_index) VALUES
('Algebra', 'Linear equations, quadratic equations, sequences and series', 'engineering', 'Mathematics', 1),
('Trigonometry', 'Trigonometric functions, identities, and equations', 'engineering', 'Mathematics', 2),
('Coordinate Geometry', 'Points, lines, circles, and conic sections', 'engineering', 'Mathematics', 3),
('Calculus', 'Limits, derivatives, and integration', 'engineering', 'Mathematics', 4),
('Mechanics', 'Motion, force, work, energy, and momentum', 'engineering', 'Physics', 5),
('Heat and Thermodynamics', 'Temperature, heat transfer, and thermodynamic processes', 'engineering', 'Physics', 6),
('Optics', 'Light, reflection, refraction, and optical instruments', 'engineering', 'Physics', 7),
('Electricity and Magnetism', 'Electric fields, circuits, and magnetic fields', 'engineering', 'Physics', 8),
('Atomic Structure', 'Atoms, molecules, and chemical bonding', 'engineering', 'Chemistry', 9),
('Chemical Reactions', 'Types of reactions and chemical kinetics', 'engineering', 'Chemistry', 10),
('Organic Chemistry', 'Hydrocarbons and organic compounds', 'engineering', 'Chemistry', 11);

-- Insert default chapters for Medical
INSERT INTO chapters (name, description, section, subject, order_index) VALUES
('Cell Biology', 'Cell structure, organelles, and cellular processes', 'medical', 'Biology', 1),
('Genetics', 'Heredity, DNA, RNA, and genetic engineering', 'medical', 'Biology', 2),
('Human Physiology', 'Body systems and their functions', 'medical', 'Biology', 3),
('Plant Biology', 'Plant structure, photosynthesis, and reproduction', 'medical', 'Biology', 4),
('Evolution and Ecology', 'Natural selection, ecosystems, and biodiversity', 'medical', 'Biology', 5),
('Atomic Structure', 'Atoms, periodic table, and chemical bonding', 'medical', 'Chemistry', 6),
('Chemical Reactions', 'Reaction types, equilibrium, and kinetics', 'medical', 'Chemistry', 7),
('Organic Chemistry', 'Biomolecules and organic reactions', 'medical', 'Chemistry', 8),
('Mechanics', 'Motion, forces, and energy in biological systems', 'medical', 'Physics', 9),
('Thermodynamics', 'Heat and energy in biological processes', 'medical', 'Physics', 10),
('Optics', 'Light and vision, medical imaging', 'medical', 'Physics', 11);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();