
-- Policy: Admins can access all verification documents
CREATE POLICY "Enable all access for admins on verification_documents"
ON public.verification_documents
FOR ALL
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- Policy: Admins can access all files in the verification_documents bucket
CREATE POLICY "Enable all access for admins on verification files"
ON storage.objects
FOR ALL
USING (bucket_id = 'verification_documents' AND public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'verification_documents' AND public.user_has_role(auth.uid(), 'admin'));
