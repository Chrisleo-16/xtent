
-- Create applications table for property applications
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenancies table for active tenant leases
CREATE TABLE IF NOT EXISTS public.tenancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  monthly_rent INTEGER NOT NULL,
  security_deposit INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  lease_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;

-- RLS policies for applications table
DO $$ 
BEGIN
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
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Anyone can create applications'
  ) THEN
    CREATE POLICY "Anyone can create applications"
      ON public.applications FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
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

-- RLS policies for tenancies table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenancies' 
    AND policyname = 'Landlords and tenants can view their tenancies'
  ) THEN
    CREATE POLICY "Landlords and tenants can view their tenancies"
      ON public.tenancies FOR SELECT
      USING (landlord_id = auth.uid() OR tenant_id = auth.uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenancies' 
    AND policyname = 'Landlords can create tenancies for their properties'
  ) THEN
    CREATE POLICY "Landlords can create tenancies for their properties"
      ON public.tenancies FOR INSERT
      WITH CHECK (landlord_id = auth.uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenancies' 
    AND policyname = 'Landlords can update their tenancies'
  ) THEN
    CREATE POLICY "Landlords can update their tenancies"
      ON public.tenancies FOR UPDATE
      USING (landlord_id = auth.uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenancies' 
    AND policyname = 'Landlords can delete their tenancies'
  ) THEN
    CREATE POLICY "Landlords can delete their tenancies"
      ON public.tenancies FOR DELETE
      USING (landlord_id = auth.uid());
  END IF;
END $$;

-- Create property-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable realtime for the new tables
ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER TABLE public.tenancies REPLICA IDENTITY FULL;

-- Add tables to realtime publication (only if they don't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'tenancies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tenancies;
  END IF;
END $$;
