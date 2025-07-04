
-- Enable Row Level Security on the leases table if not already enabled
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

-- Allow tenants to view their own leases
CREATE POLICY "Tenants can view their own leases"
  ON public.leases
  FOR SELECT
  USING (auth.uid() = tenant_id);

-- Allow landlords to view leases associated with them
CREATE POLICY "Landlords can view leases they own"
  ON public.leases
  FOR SELECT
  USING (auth.uid() = landlord_id);

-- Allow new tenants to create a lease for themselves when accepting a valid invitation
CREATE POLICY "Tenants can create a lease when accepting an invitation"
  ON public.leases
  FOR INSERT
  WITH CHECK (
    auth.uid() = tenant_id AND
    EXISTS (
      SELECT 1
      FROM public.tenant_invitations
      WHERE tenant_invitations.email = auth.email()
        AND tenant_invitations.status = 'pending'
        AND tenant_invitations.property_id = leases.property_id
        AND tenant_invitations.landlord_id = leases.landlord_id
    )
  );
  
-- Allow landlords to create leases for their properties
CREATE POLICY "Landlords can create leases"
  ON public.leases
  FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

-- Allow landlords to update their leases
CREATE POLICY "Landlords can update their leases"
  ON public.leases
  FOR UPDATE
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Allow landlords to delete their leases
CREATE POLICY "Landlords can delete their leases"
  ON public.leases
  FOR DELETE
  USING (auth.uid() = landlord_id);

