
-- Add RLS policies to allow admins to view all profiles and verification documents
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.user_has_role(auth.uid(), 'admin'));

-- Policy for admins to update any profile (for verification status changes)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.user_has_role(auth.uid(), 'admin'));

-- Policy for admins to view all verification documents
CREATE POLICY "Admins can view all verification documents" 
ON public.verification_documents 
FOR SELECT 
USING (public.user_has_role(auth.uid(), 'admin'));

-- Policy for admins to update verification documents
CREATE POLICY "Admins can update all verification documents" 
ON public.verification_documents 
FOR UPDATE 
USING (public.user_has_role(auth.uid(), 'admin'));
