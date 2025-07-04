
-- Grant admin role to your specific user account (yegonalvin20@gmail.com)
-- First, let's check if the user exists and get their ID
INSERT INTO public.user_roles (user_id, role, is_primary)
SELECT p.id, 'admin', false
FROM public.profiles p 
WHERE p.email = 'yegonalvin20@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id AND ur.role = 'admin'
);

-- Update the profiles table to reflect admin role
UPDATE public.profiles 
SET role = 'admin', verification_status = 'verified'
WHERE email = 'yegonalvin20@gmail.com';
