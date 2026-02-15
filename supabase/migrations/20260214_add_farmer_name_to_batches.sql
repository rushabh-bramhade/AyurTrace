
-- Migration to add farmer_name to herb_batches
ALTER TABLE public.herb_batches ADD COLUMN IF NOT EXISTS farmer_name TEXT;

-- Update existing batches to have the farmer name from profiles if possible
UPDATE public.herb_batches hb
SET farmer_name = p.name
FROM public.profiles p
WHERE hb.farmer_id = p.user_id
AND hb.farmer_name IS NULL;

-- Make farmer_name NOT NULL after updating existing records
-- ALTER TABLE public.herb_batches ALTER COLUMN farmer_name SET NOT NULL;
