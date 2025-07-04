
-- Ensure RLS policies exist for applications table
DO $$ 
BEGIN
  -- Check if policies already exist and create them if they don't
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Users can view their own applications'
  ) THEN
    CREATE POLICY "Users can view their own applications"
      ON public.applications FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.email = applications.applicant_email
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Users can create applications'
  ) THEN
    CREATE POLICY "Users can create applications"
      ON public.applications FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.email = applications.applicant_email
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Property owners can view applications for their properties'
  ) THEN
    CREATE POLICY "Property owners can view applications for their properties"
      ON public.applications FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.properties 
          WHERE properties.id = applications.property_id 
          AND properties.landlord_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Property owners can update applications for their properties'
  ) THEN
    CREATE POLICY "Property owners can update applications for their properties"
      ON public.applications FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.properties 
          WHERE properties.id = applications.property_id 
          AND properties.landlord_id = auth.uid()
        )
      );
  END IF;
END $$;
