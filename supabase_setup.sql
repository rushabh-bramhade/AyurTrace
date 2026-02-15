
-- CONSOLIDATED SUPABASE SETUP SCRIPT
-- Copy and paste this into the Supabase Dashboard > SQL Editor and run it.

-- 1. Create app_role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('farmer', 'customer', 'admin');
    END IF;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT,
  certifications TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create herb_batches table
CREATE TABLE IF NOT EXISTS public.herb_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_code TEXT NOT NULL UNIQUE,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT,
  herb_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  description TEXT,
  harvest_region TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  processing_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT '100g',
  hash TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.herb_batches ENABLE ROW LEVEL SECURITY;

-- 5. Create saved_herbs table
CREATE TABLE IF NOT EXISTS public.saved_herbs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  herb_id TEXT NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, herb_id)
);

ALTER TABLE public.saved_herbs ENABLE ROW LEVEL SECURITY;

-- 6. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.herb_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (batch_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 7. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_herb_batches_farmer_id ON public.herb_batches(farmer_id);
CREATE INDEX IF NOT EXISTS idx_herb_batches_status ON public.herb_batches(status);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- 8. Functions & Triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer')
  );

  RETURN NEW;
END;
$$;

-- Drop triggers if they exist and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_herb_batches_updated_at ON public.herb_batches;
CREATE TRIGGER update_herb_batches_updated_at
  BEFORE UPDATE ON public.herb_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User Roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Herb Batches
DROP POLICY IF EXISTS "Anyone can view herb batches" ON public.herb_batches;
CREATE POLICY "Anyone can view herb batches" ON public.herb_batches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Farmers can insert own batches" ON public.herb_batches;
CREATE POLICY "Farmers can insert own batches" ON public.herb_batches FOR INSERT TO authenticated WITH CHECK (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));
DROP POLICY IF EXISTS "Farmers can update own batches" ON public.herb_batches;
CREATE POLICY "Farmers can update own batches" ON public.herb_batches FOR UPDATE TO authenticated USING (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));
DROP POLICY IF EXISTS "Farmers can delete own batches" ON public.herb_batches;
CREATE POLICY "Farmers can delete own batches" ON public.herb_batches FOR DELETE TO authenticated USING (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));
DROP POLICY IF EXISTS "Admins can delete any batch" ON public.herb_batches;
CREATE POLICY "Admins can delete any batch" ON public.herb_batches FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update any batch" ON public.herb_batches;
CREATE POLICY "Admins can update any batch" ON public.herb_batches FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Saved Herbs
DROP POLICY IF EXISTS "Users can view own saved herbs" ON public.saved_herbs;
CREATE POLICY "Users can view own saved herbs" ON public.saved_herbs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can save herbs" ON public.saved_herbs;
CREATE POLICY "Users can save herbs" ON public.saved_herbs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unsave herbs" ON public.saved_herbs;
CREATE POLICY "Users can unsave herbs" ON public.saved_herbs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'customer'));
DROP POLICY IF EXISTS "Customers can update own reviews" ON public.reviews;
CREATE POLICY "Customers can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'customer'));
DROP POLICY IF EXISTS "Customers can delete own reviews" ON public.reviews;
CREATE POLICY "Customers can delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'customer'));

-- 9. Storage Bucket (Run this in Dashboard if possible, but SQL also works)
-- Note: storage.buckets and storage.objects policies are usually managed via Dashboard UI
-- but here are the SQL equivalents:
INSERT INTO storage.buckets (id, name, public) VALUES ('herb-images', 'herb-images', true) ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read herb images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'herb-images');

-- Allow authenticated farmers to upload herb images to their own folder
DROP POLICY IF EXISTS "Farmers can upload own herb images" ON storage.objects;
CREATE POLICY "Farmers can upload own herb images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'herb-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow farmers to update their own herb images
DROP POLICY IF EXISTS "Farmers can update own herb images" ON storage.objects;
CREATE POLICY "Farmers can update own herb images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'herb-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow farmers to delete their own herb images
DROP POLICY IF EXISTS "Farmers can delete own herb images" ON storage.objects;
CREATE POLICY "Farmers can delete own herb images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'herb-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
