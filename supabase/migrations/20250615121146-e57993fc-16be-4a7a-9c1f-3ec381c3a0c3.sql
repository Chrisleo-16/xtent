
-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Backfill email addresses for existing users from the auth.users table
-- This requires elevated privileges and will be run as the database admin.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;

-- Update the handle_new_user function to include email when creating new profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'tenant'::public.user_role)
  );

  -- Insert primary role
  INSERT INTO public.user_roles (user_id, role, is_primary)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'tenant'::public.user_role),
    TRUE
  );

  RETURN NEW;
END;
$function$
