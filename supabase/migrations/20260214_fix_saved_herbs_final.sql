-- FIX FOR SAVED HERBS SYNC ERROR
-- Root Cause: Type mismatch (ATB-* strings into UUID column) and missing RLS references.
-- Solution: Standardize table structure and use TEXT for herb_id to support legacy and new IDs.

-- 1. Drop existing table to ensure clean state with correct constraints
DROP TABLE IF EXISTS public.saved_herbs;

-- 2. Create table with senior-engineer grade constraints
CREATE TABLE public.saved_herbs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Explicit reference to auth.users for solid RLS
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Use TEXT for herb_id to handle both UUIDs and static batch codes (ATB-2025-*)
  herb_id TEXT NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent duplicate saves for the same user/herb combination
  UNIQUE(user_id, herb_id)
);

-- 3. Enable Row Level Security
ALTER TABLE public.saved_herbs ENABLE ROW LEVEL SECURITY;

-- 4. Create precise RLS Policies

-- SELECT: Allow users to view only their own saved herbs
DROP POLICY IF EXISTS "Users can view own saved herbs" ON public.saved_herbs;
CREATE POLICY "Users can view own saved herbs"
ON public.saved_herbs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Allow authenticated users to save herbs for themselves
DROP POLICY IF EXISTS "Users can save herbs" ON public.saved_herbs;
CREATE POLICY "Users can save herbs"
ON public.saved_herbs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: Allow users to remove only their own saved herbs
DROP POLICY IF EXISTS "Users can unsave herbs" ON public.saved_herbs;
CREATE POLICY "Users can unsave herbs"
ON public.saved_herbs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Add helpful comment to the table
COMMENT ON TABLE public.saved_herbs IS 'Stores user favorite herbs/batches. herb_id is TEXT to support heterogeneous ID formats.';
