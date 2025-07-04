
-- First, check if the user exists and get their details
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.verification_status,
  p.created_at
FROM public.profiles p
WHERE p.email = 'yegonalvin20@gmail.com';

-- If the user exists, add admin role to user_roles table
INSERT INTO public.user_roles (user_id, role, is_primary)
SELECT 
  p.id,
  'admin'::user_role,
  false  -- Keep existing primary role, add admin as secondary
FROM public.profiles p
WHERE p.email = 'yegonalvin20@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'admin'
  );

-- Update the user's verification status to verified (admin should be verified)
UPDATE public.profiles 
SET verification_status = 'verified'::verification_status
WHERE email = 'yegonalvin20@gmail.com';

-- Get the final user details to confirm the operation
SELECT 
  p.id as user_id,
  p.email,
  p.name,
  p.role as primary_role,
  p.verification_status,
  p.created_at,
  array_agg(ur.role) as all_roles,
  now() as operation_timestamp
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'yegonalvin20@gmail.com'
GROUP BY p.id, p.email, p.name, p.role, p.verification_status, p.created_at;
