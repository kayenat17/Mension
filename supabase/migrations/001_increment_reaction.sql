-- Migration: Add atomic reaction increment function
-- This prevents the race condition where two users reacting simultaneously
-- can cause count drift (read-modify-write race).
--
-- Run this in your Supabase SQL editor.
-- The client code will automatically use this if it exists.

CREATE OR REPLACE FUNCTION increment_reaction(
  post_id uuid,
  reaction_field text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format(
    'UPDATE community_posts SET %I = %I + 1 WHERE id = $1',
    reaction_field,
    reaction_field
  ) USING post_id;
END;
$$;
