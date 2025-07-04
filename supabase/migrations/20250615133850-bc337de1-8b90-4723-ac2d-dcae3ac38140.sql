
-- Phase 1: Add 'admin' role to the existing user_role enum
-- This needs to be committed before it can be used in policies.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- Phase 2: Create a new ENUM type for verification status
CREATE TYPE public.verification_status AS ENUM (
  'unverified',
  'pending',
  'verified',
  'rejected'
);

-- Phase 3: Add verification columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'unverified',
ADD COLUMN rejection_reason TEXT;

-- Phase 4: Create a new ENUM type for invitation types
CREATE TYPE public.invitation_type AS ENUM (
  'tenant',
  'caretaker'
);

-- Phase 5: Add invitation_type to the tenant_invitations table
ALTER TABLE public.tenant_invitations
ADD COLUMN invitation_type public.invitation_type NOT NULL DEFAULT 'tenant';

-- Phase 6: Create a private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('verification_documents', 'verification_documents', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Phase 7: Create a table to track verification documents
CREATE TABLE public.verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  document_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type)
);

-- Phase 8: Enable Row Level Security and add user-specific policy
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own verification_documents"
ON public.verification_documents
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Phase 9: Set up user-specific security policies for the storage bucket
CREATE POLICY "Authenticated users can upload their verification files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own verification files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own verification files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text);
