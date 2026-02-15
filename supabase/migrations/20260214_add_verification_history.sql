
-- 1. Create verification_history table
CREATE TABLE IF NOT EXISTS public.verification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.herb_batches(id) ON DELETE CASCADE,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'authentic' -- authentic, warning, suspicious
);

ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification history" ON public.verification_history;
CREATE POLICY "Users can view own verification history" ON public.verification_history 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert verification record" ON public.verification_history;
CREATE POLICY "Users can insert verification record" ON public.verification_history 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2. Ensure herb_batches has the required fields for the new UI
-- (Most are already there, but we ensure status and certifications are handled)
-- Status is already in herb_batches from setup.sql

-- 3. Update existing batches with some statuses for testing if they exist
UPDATE public.herb_batches SET status = 'authentic' WHERE status = 'pending';
