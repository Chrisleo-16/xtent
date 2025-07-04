
-- Allow public read access to properties, which is needed for invitation acceptance
-- and for the public properties listing page.
CREATE POLICY "Public can view all properties"
  ON public.properties
  FOR SELECT
  USING (true);

-- Allow anyone to read a pending invitation. This is needed for a new tenant
-- to accept an invitation without being logged in first.
CREATE POLICY "Anyone can view a pending invitation"
  ON public.tenant_invitations
  FOR SELECT
  USING (status = 'pending'::invitation_status);
