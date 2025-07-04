
-- Create a storage bucket for verification documents if it doesn't already exist.
-- This bucket is private and has limits on file size and types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'verification_documents', 'verification_documents', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'verification_documents');

-- Enable RLS on verification_documents table
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Add Row-Level Security policies to the `verification_documents` table for users and admins.
DROP POLICY IF EXISTS "Allow users to view their own verification documents" ON public.verification_documents;
CREATE POLICY "Allow users to view their own verification documents"
ON public.verification_documents FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own verification documents" ON public.verification_documents;
CREATE POLICY "Allow users to insert their own verification documents"
ON public.verification_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own verification documents" ON public.verification_documents;
CREATE POLICY "Allow users to delete their own verification documents"
ON public.verification_documents FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable all access for admins on verification_documents" ON public.verification_documents;
CREATE POLICY "Enable all access for admins on verification_documents"
ON public.verification_documents
FOR ALL
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));


-- Add Row-Level Security policies for the `verification_documents` storage bucket.
DROP POLICY IF EXISTS "Allow users to upload verification files" ON storage.objects;
CREATE POLICY "Allow users to upload verification files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to view their own verification files" ON storage.objects;
CREATE POLICY "Allow users to view their own verification files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to update their own verification files" ON storage.objects;
CREATE POLICY "Allow users to update their own verification files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to delete their own verification files" ON storage.objects;
CREATE POLICY "Allow users to delete their own verification files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Enable all access for admins on verification files" ON storage.objects;
CREATE POLICY "Enable all access for admins on verification files"
ON storage.objects
FOR ALL
USING (bucket_id = 'verification_documents' AND public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'verification_documents' AND public.user_has_role(auth.uid(), 'admin'));


-- Enable Row-Level Security on the `profiles` table to protect user data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add Row-Level Security policies to the `profiles` table.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can access all profiles" ON public.profiles;
CREATE POLICY "Admins can access all profiles"
ON public.profiles FOR ALL
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- Create a database function that allows users to request verification.
-- This will update their status to 'pending'.
CREATE OR REPLACE FUNCTION public.request_verification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET verification_status = 'pending'
  WHERE id = auth.uid() AND verification_status IN ('unverified', 'rejected');
END;
$$;
