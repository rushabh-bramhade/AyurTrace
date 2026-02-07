
-- Create storage bucket for herb batch images
INSERT INTO storage.buckets (id, name, public) VALUES ('herb-images', 'herb-images', true);

-- Allow anyone to view herb images
CREATE POLICY "Herb images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'herb-images');

-- Allow authenticated farmers to upload images
CREATE POLICY "Farmers can upload herb images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'herb-images'
  AND auth.uid() IS NOT NULL
);

-- Allow farmers to update their own images
CREATE POLICY "Users can update own herb images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'herb-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow farmers to delete their own images
CREATE POLICY "Users can delete own herb images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'herb-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create saved_herbs table for customer dashboard
CREATE TABLE public.saved_herbs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  batch_id UUID NOT NULL REFERENCES public.herb_batches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, batch_id)
);

ALTER TABLE public.saved_herbs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved herbs"
ON public.saved_herbs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save herbs"
ON public.saved_herbs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave herbs"
ON public.saved_herbs FOR DELETE
USING (auth.uid() = user_id);
