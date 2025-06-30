/*
  # Collaboration System Tables

  1. New Tables
    - `collaborative_actions` - Stores all user actions in collaborative sessions
    - `lab_sessions` - Stores information about collaborative lab sessions
    - `session_members` - Tracks participants in lab sessions
    - `voice_notes` - Stores voice recordings shared during collaboration
    - `screen_annotations` - Stores visual annotations added to the screen
    - `breakout_groups` - Manages smaller collaborative groups within a session
    - `peer_reviews` - Stores peer feedback and evaluations

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure data privacy between sessions
*/

-- Collaborative Actions Table
CREATE TABLE IF NOT EXISTS collaborative_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  action_type text NOT NULL,
  action_data jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now(),
  requires_approval boolean DEFAULT false,
  approved_by uuid REFERENCES profiles(id),
  reverted_at timestamptz,
  vector_clock jsonb NOT NULL DEFAULT '{}'
);

-- Lab Sessions Table
CREATE TABLE IF NOT EXISTS lab_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id),
  session_name text,
  creator_id uuid REFERENCES profiles(id),
  status text NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'completed', 'archived')),
  max_participants integer NOT NULL DEFAULT 4,
  current_participants integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  session_data jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Session Members Table
CREATE TABLE IF NOT EXISTS session_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  role text NOT NULL CHECK (role IN ('leader', 'member', 'observer')),
  permissions jsonb DEFAULT '{}',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_active timestamptz NOT NULL DEFAULT now(),
  is_online boolean DEFAULT true,
  cursor_position jsonb,
  current_tool text,
  UNIQUE (session_id, user_id)
);

-- Voice Notes Table
CREATE TABLE IF NOT EXISTS voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  audio_url text NOT NULL,
  duration integer,
  transcript text,
  position jsonb,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Screen Annotations Table
CREATE TABLE IF NOT EXISTS screen_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  type text NOT NULL CHECK (type IN ('arrow', 'circle', 'highlight', 'text')),
  position jsonb NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Breakout Groups Table
CREATE TABLE IF NOT EXISTS breakout_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id),
  experiment_id uuid REFERENCES experiments(id),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Breakout Group Members Table
CREATE TABLE IF NOT EXISTS breakout_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES breakout_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- Peer Reviews Table
CREATE TABLE IF NOT EXISTS peer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id),
  reviewee_id uuid NOT NULL REFERENCES profiles(id),
  experiment_id uuid NOT NULL REFERENCES experiments(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback text,
  criteria jsonb NOT NULL DEFAULT '{}',
  is_anonymous boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Session Recordings Table
CREATE TABLE IF NOT EXISTS session_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  duration integer,
  bookmarks jsonb DEFAULT '[]',
  highlights jsonb DEFAULT '[]',
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE collaborative_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakout_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakout_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborative_actions
CREATE POLICY "Users can view actions in their sessions"
  ON collaborative_actions
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = collaborative_actions.session_id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create actions in their sessions"
  ON collaborative_actions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = collaborative_actions.session_id
      AND session_members.user_id = auth.uid()
    )
  );

-- RLS Policies for lab_sessions
CREATE POLICY "Users can view sessions they are part of"
  ON lab_sessions
  FOR SELECT
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = lab_sessions.id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions"
  ON lab_sessions
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Session creators can update their sessions"
  ON lab_sessions
  FOR UPDATE
  USING (creator_id = auth.uid());

-- RLS Policies for session_members
CREATE POLICY "Users can view members in their sessions"
  ON session_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members AS sm
      WHERE sm.session_id = session_members.session_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join sessions"
  ON session_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for voice_notes
CREATE POLICY "Users can view voice notes in their sessions"
  ON voice_notes
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = voice_notes.session_id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create voice notes in their sessions"
  ON voice_notes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = voice_notes.session_id
      AND session_members.user_id = auth.uid()
    )
  );

-- RLS Policies for screen_annotations
CREATE POLICY "Users can view annotations in their sessions"
  ON screen_annotations
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = screen_annotations.session_id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create annotations in their sessions"
  ON screen_annotations
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = screen_annotations.session_id
      AND session_members.user_id = auth.uid()
    )
  );

-- RLS Policies for breakout_groups
CREATE POLICY "Users can view breakout groups in their sessions"
  ON breakout_groups
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = breakout_groups.session_id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create breakout groups in their sessions"
  ON breakout_groups
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = breakout_groups.session_id
      AND session_members.user_id = auth.uid()
      AND session_members.role IN ('leader', 'member')
    )
  );

-- RLS Policies for breakout_group_members
CREATE POLICY "Users can view breakout group members"
  ON breakout_group_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM breakout_groups
      JOIN session_members ON session_members.session_id = breakout_groups.session_id
      WHERE breakout_groups.id = breakout_group_members.group_id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join breakout groups"
  ON breakout_group_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for peer_reviews
CREATE POLICY "Users can view reviews they gave or received"
  ON peer_reviews
  FOR SELECT
  USING (
    reviewer_id = auth.uid() OR
    reviewee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = peer_reviews.session_id
      AND session_members.user_id = auth.uid()
      AND session_members.role = 'leader'
    )
  );

CREATE POLICY "Users can create reviews"
  ON peer_reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = peer_reviews.session_id
      AND session_members.user_id = auth.uid()
    )
  );

-- RLS Policies for session_recordings
CREATE POLICY "Users can view recordings of their sessions"
  ON session_recordings
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = session_recordings.session_id
      AND session_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recordings"
  ON session_recordings
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM session_members
      WHERE session_members.session_id = session_recordings.session_id
      AND session_members.user_id = auth.uid()
      AND session_members.role IN ('leader', 'member')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collaborative_actions_session_id ON collaborative_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_session_members_session_id ON session_members(session_id);
CREATE INDEX IF NOT EXISTS idx_session_members_user_id ON session_members(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_session_id ON voice_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_screen_annotations_session_id ON screen_annotations(session_id);
CREATE INDEX IF NOT EXISTS idx_breakout_groups_session_id ON breakout_groups(session_id);
CREATE INDEX IF NOT EXISTS idx_breakout_group_members_group_id ON breakout_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_session_id ON peer_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer_id ON peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewee_id ON peer_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON session_recordings(session_id);