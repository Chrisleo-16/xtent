
-- Add caretaker_id to properties table to assign caretakers to properties
ALTER TABLE public.properties ADD COLUMN caretaker_id UUID REFERENCES public.profiles(id);

-- Create index for better performance when querying properties by caretaker
CREATE INDEX idx_properties_caretaker_id ON public.properties(caretaker_id);

-- Add RLS policies for caretaker access to properties
CREATE POLICY "Caretakers can view assigned properties" 
  ON public.properties 
  FOR SELECT 
  USING (auth.uid() = caretaker_id);

-- Add RLS policies for caretaker access to maintenance requests
CREATE POLICY "Caretakers can view maintenance requests for assigned properties" 
  ON public.maintenance_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = maintenance_requests.property_id 
      AND p.caretaker_id = auth.uid()
    )
  );

CREATE POLICY "Caretakers can update maintenance requests for assigned properties" 
  ON public.maintenance_requests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = maintenance_requests.property_id 
      AND p.caretaker_id = auth.uid()
    )
  );

-- Add RLS policies for caretaker access to applications
CREATE POLICY "Caretakers can view applications for assigned properties" 
  ON public.applications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = applications.property_id 
      AND p.caretaker_id = auth.uid()
    )
  );

CREATE POLICY "Caretakers can update applications for assigned properties" 
  ON public.applications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = applications.property_id 
      AND p.caretaker_id = auth.uid()
    )
  );

-- Add RLS policies for caretaker access to leases
CREATE POLICY "Caretakers can view leases for assigned properties" 
  ON public.leases 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = leases.property_id 
      AND p.caretaker_id = auth.uid()
    )
  );

-- Add RLS policies for caretaker access to tenancies
CREATE POLICY "Caretakers can view tenancies for assigned properties" 
  ON public.tenancies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = tenancies.property_id 
      AND p.caretaker_id = auth.uid()
    )
  );
