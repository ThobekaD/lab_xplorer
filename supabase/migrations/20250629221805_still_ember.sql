/*
  # Fix profiles table RLS policy for user registration

  1. Security Changes
    - Add INSERT policy for profiles table to allow users to create their own profile
    - This enables new user registration to work properly
    
  2. Policy Details
    - Users can insert their own profile record when the profile id matches their auth uid
    - This is essential for the signup flow to complete successfully
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());