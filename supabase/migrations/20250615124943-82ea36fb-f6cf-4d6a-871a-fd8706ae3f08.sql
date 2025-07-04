
-- Enable RLS and define policies for the 'properties' table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage their own properties"
  ON public.properties FOR ALL
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Authenticated users can view all properties"
  ON public.properties FOR SELECT
  USING (auth.role() = 'authenticated');

-- Enable RLS and define policies for the 'leases' table
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage leases linked to them"
  ON public.leases FOR ALL
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view their own lease"
  ON public.leases FOR SELECT
  USING (auth.uid() = tenant_id);

-- Enable RLS and define policies for the 'payments' table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage payments linked to them"
  ON public.payments FOR ALL
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = tenant_id);

-- Enable RLS and define policies for the 'tenant_invitations' table
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage their own invitations"
  ON public.tenant_invitations FOR ALL
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Enable RLS and define policies for the 'maintenance_requests' table
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage maintenance requests on their properties"
  ON public.maintenance_requests FOR ALL
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Tenants can manage their own maintenance requests"
  ON public.maintenance_requests FOR ALL
  USING (auth.uid() = tenant_id)
  WITH CHECK (auth.uid() = tenant_id);

-- Enable RLS and define policies for the 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view profiles of their landlord or tenants"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.leases
      WHERE (leases.landlord_id = auth.uid() AND leases.tenant_id = profiles.id)
         OR (leases.tenant_id = auth.uid() AND leases.landlord_id = profiles.id)
    )
  );
