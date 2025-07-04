
-- Create a new ENUM type for invitation status
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Create the tenant_invitations table
CREATE TABLE public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, -- Tenant's name for personalization
  email TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.tenant_invitations IS 'Stores invitations for tenants to join the platform.';
COMMENT ON COLUMN public.tenant_invitations.lease_id IS 'Optional link to a pre-created lease for the tenant.';
COMMENT ON COLUMN public.tenant_invitations.accepted_by_user_id IS 'The user profile created or linked upon accepting the invitation.';

-- Enable Row Level Security
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for landlords
CREATE POLICY "Landlords can manage their own sent invitations"
  ON public.tenant_invitations
  FOR ALL
  USING (landlord_id = auth.uid());
