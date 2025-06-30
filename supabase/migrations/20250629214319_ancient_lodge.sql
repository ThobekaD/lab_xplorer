/*
  # Schema update for assessment system

  1. New Tables
    - No new tables created, updating existing tables

  2. Changes
    - Add new columns to assessments table:
      - hints (jsonb): Hints for questions
      - image_url (text): Image for the question
      - context (text): Additional context for the question
      - tolerance (numeric): Acceptable margin of error for numerical questions
      - unit (text): Unit for numerical questions
      - topic (text): Topic categorization
      - points (integer): Points value for the question
    
    - Add new columns to assessment_attempts table:
      - max_score (numeric): Maximum possible score
      - percentage (numeric): Score as a percentage
      - time_taken (integer): Time taken in seconds
      - hints_used (integer): Number of hints used

  3. Security
    - Enable Row Level Security on both tables
    - Create policies for viewing, creating, and updating
*/

-- Add new columns to existing assessments table (only if they don't exist)
DO $$ 
BEGIN
    -- Add hints column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'hints') THEN
        ALTER TABLE assessments ADD COLUMN hints jsonb;
    END IF;
    
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'image_url') THEN
        ALTER TABLE assessments ADD COLUMN image_url text;
    END IF;
    
    -- Add context column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'context') THEN
        ALTER TABLE assessments ADD COLUMN context text;
    END IF;
    
    -- Add tolerance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'tolerance') THEN
        ALTER TABLE assessments ADD COLUMN tolerance numeric;
    END IF;
    
    -- Add unit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'unit') THEN
        ALTER TABLE assessments ADD COLUMN unit text;
    END IF;
    
    -- Add topic column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'topic') THEN
        ALTER TABLE assessments ADD COLUMN topic text;
    END IF;
    
    -- Add points column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'points') THEN
        ALTER TABLE assessments ADD COLUMN points integer DEFAULT 1;
    END IF;
END $$;

-- Add new columns to existing assessment_attempts table (only if they don't exist)
DO $$ 
BEGIN
    -- Add max_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_attempts' AND column_name = 'max_score') THEN
        ALTER TABLE assessment_attempts ADD COLUMN max_score numeric(5,2);
    END IF;
    
    -- Add percentage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_attempts' AND column_name = 'percentage') THEN
        ALTER TABLE assessment_attempts ADD COLUMN percentage numeric(5,2);
    END IF;
    
    -- Add time_taken column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_attempts' AND column_name = 'time_taken') THEN
        ALTER TABLE assessment_attempts ADD COLUMN time_taken integer;
    END IF;
    
    -- Add hints_used column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_attempts' AND column_name = 'hints_used') THEN
        ALTER TABLE assessment_attempts ADD COLUMN hints_used integer DEFAULT 0;
    END IF;
END $$;

-- Enable Row Level Security (only if not already enabled)
DO $$ 
BEGIN
    -- Check and enable RLS on assessments
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'assessments' 
        AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Check and enable RLS on assessment_attempts
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'assessment_attempts' 
        AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies only if they don't exist
DO $$ 
BEGIN
    -- Assessments policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessments' 
        AND policyname = 'Assessments are viewable by all users'
    ) THEN
        CREATE POLICY "Assessments are viewable by all users"
        ON assessments
        FOR SELECT
        TO public
        USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessments' 
        AND policyname = 'Teachers can create assessments'
    ) THEN
        CREATE POLICY "Teachers can create assessments"
        ON assessments
        FOR INSERT
        TO public
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('teacher', 'admin')
            )
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessments' 
        AND policyname = 'Teachers can update their assessments'
    ) THEN
        CREATE POLICY "Teachers can update their assessments"
        ON assessments
        FOR UPDATE
        TO public
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('teacher', 'admin')
            )
        );
    END IF;
    
    -- Assessment attempts policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessment_attempts' 
        AND policyname = 'Users can view their own assessment attempts'
    ) THEN
        CREATE POLICY "Users can view their own assessment attempts"
        ON assessment_attempts
        FOR SELECT
        TO public
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessment_attempts' 
        AND policyname = 'Teachers can view all assessment attempts'
    ) THEN
        CREATE POLICY "Teachers can view all assessment attempts"
        ON assessment_attempts
        FOR SELECT
        TO public
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('teacher', 'admin')
            )
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessment_attempts' 
        AND policyname = 'Users can create their own assessment attempts'
    ) THEN
        CREATE POLICY "Users can create their own assessment attempts"
        ON assessment_attempts
        FOR INSERT
        TO public
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_assessments_experiment_id ON assessments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessments_topic ON assessments(topic);
CREATE INDEX IF NOT EXISTS idx_assessments_difficulty ON assessments(difficulty);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_session ON assessment_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_completed ON assessment_attempts(completed_at);

-- Verify the schema updates
SELECT 
    'assessments' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'assessment_attempts' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessment_attempts' 
AND table_schema = 'public'
ORDER BY ordinal_position;