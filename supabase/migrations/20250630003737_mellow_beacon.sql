/*
  # Fix infinite recursion in session_members RLS policy

  1. Changes
    - Fix the "Session members can view sessions" policy on lab_sessions table
    - Correct the self-reference in the WHERE clause that was causing infinite recursion
    - Replace session_members.id with lab_sessions.id in the comparison

  2. Security
    - Maintains the same security intent of the original policy
    - Users can still only view sessions they are members of
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Session members can view sessions" ON public.lab_sessions;

-- Recreate the policy with the correct reference
CREATE POLICY "Session members can view sessions"
ON public.lab_sessions
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM session_members
    WHERE session_members.session_id = lab_sessions.id 
    AND session_members.user_id = auth.uid()
  )
);