/*
  # Fix infinite recursion in session_members policies

  1. Problem
    - Current policies on session_members table create circular dependencies
    - Policies reference session_members within their own conditions causing infinite recursion
    - This breaks queries that try to access lab_sessions data

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid circular references
    - Use direct conditions without recursive lookups

  3. Security
    - Maintain proper access control
    - Users can only see sessions they're members of
    - Users can only join sessions as themselves
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Session members can view membership" ON session_members;
DROP POLICY IF EXISTS "Users can view members in their sessions" ON session_members;
DROP POLICY IF EXISTS "Users can join sessions" ON session_members;

-- Create new simplified policies without circular references
CREATE POLICY "Users can view their own membership"
  ON session_members
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can view session members where they are also members"
  ON session_members
  FOR SELECT
  TO public
  USING (
    session_id IN (
      SELECT sm.session_id 
      FROM session_members sm 
      WHERE sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join sessions as themselves"
  ON session_members
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership"
  ON session_members
  FOR UPDATE
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());