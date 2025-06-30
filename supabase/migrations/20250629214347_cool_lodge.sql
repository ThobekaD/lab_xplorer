/*
  # Gamification System Schema

  1. New Tables
    - user_badges: Stores badges earned by users
    - digital_certificates: Stores certificates earned by users
    - leaderboards: Stores leaderboard entries

  2. Changes
    - Add new columns to user_achievements table:
      - badge_id (text): Reference to the badge identifier
      - certificate_data (jsonb): Certificate data if applicable
      - verification_code (text): Verification code for certificates

  3. Security
    - Enable Row Level Security on all new tables
    - Create policies for viewing and creating records
*/

-- Add new columns to user_achievements table
DO $$ 
BEGIN
    -- Add badge_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_achievements' AND column_name = 'badge_id') THEN
        ALTER TABLE user_achievements ADD COLUMN badge_id TEXT;
    END IF;
    
    -- Add certificate_data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_achievements' AND column_name = 'certificate_data') THEN
        ALTER TABLE user_achievements ADD COLUMN certificate_data JSONB;
    END IF;
    
    -- Add verification_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_achievements' AND column_name = 'verification_code') THEN
        ALTER TABLE user_achievements ADD COLUMN verification_code TEXT;
    END IF;
END $$;

-- Create user_badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  badge_id TEXT NOT NULL,
  experiment_id UUID REFERENCES experiments(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  performance_data JSONB,
  UNIQUE(user_id, badge_id, experiment_id)
);

-- Create digital_certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS digital_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  experiment_id UUID REFERENCES experiments(id),
  certificate_type TEXT CHECK (certificate_type IN ('completion', 'mastery', 'excellence')),
  verification_code TEXT UNIQUE NOT NULL,
  performance_score NUMERIC(5,2),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Create leaderboards table if it doesn't exist
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  score NUMERIC NOT NULL,
  rank INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on new tables
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges"
  ON user_badges
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can view other users' badges"
  ON user_badges
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can create badges"
  ON user_badges
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for digital_certificates
CREATE POLICY "Users can view their own certificates"
  ON digital_certificates
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can view other users' certificates"
  ON digital_certificates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can create certificates"
  ON digital_certificates
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for leaderboards
CREATE POLICY "Anyone can view leaderboards"
  ON leaderboards
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can update leaderboards"
  ON leaderboards
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_digital_certificates_user_id ON digital_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_certificates_experiment_id ON digital_certificates(experiment_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period_start, period_end);

-- Create function to increment XP
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_xp INTEGER;
BEGIN
  -- Get current XP
  SELECT xp INTO current_xp FROM profiles WHERE id = user_id;
  
  -- Update XP
  UPDATE profiles SET xp = current_xp + amount WHERE id = user_id;
  
  -- Return new XP value
  RETURN current_xp + amount;
END;
$$;

-- Verify the schema updates
SELECT 
    'user_badges' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_badges' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'digital_certificates' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'digital_certificates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'leaderboards' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leaderboards' 
AND table_schema = 'public'
ORDER BY ordinal_position;