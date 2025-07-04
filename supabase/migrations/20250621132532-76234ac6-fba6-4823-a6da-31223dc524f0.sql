
-- Create RPC function for cascade deleting property and all related records
CREATE OR REPLACE FUNCTION delete_property_and_related(prop_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
  DELETE FROM tenant_utility_allocations WHERE tenant_id IN (
    SELECT tenant_id FROM tenancies WHERE property_id = prop_id
  );
  
  DELETE FROM utility_payments WHERE tenant_id IN (
    SELECT tenant_id FROM tenancies WHERE property_id = prop_id
  );
  
  DELETE FROM shared_bill_splits WHERE recurring_bill_id IN (
    SELECT id FROM recurring_bills WHERE property_id = prop_id
  );
  
  DELETE FROM recurring_bills WHERE property_id = prop_id;
  DELETE FROM utility_bills WHERE property_id = prop_id;
  DELETE FROM utility_meters WHERE property_id = prop_id;
  DELETE FROM tenant_utility_allocations WHERE utility_bill_id IN (
    SELECT id FROM utility_bills WHERE property_id = prop_id
  );
  
  DELETE FROM payments WHERE lease_id IN (
    SELECT id FROM leases WHERE property_id = prop_id
  );
  
  DELETE FROM communications WHERE property_id = prop_id;
  DELETE FROM maintenance_requests WHERE property_id = prop_id;
  DELETE FROM tenant_invitations WHERE property_id = prop_id;
  DELETE FROM tenancies WHERE property_id = prop_id;
  DELETE FROM leases WHERE property_id = prop_id;
  DELETE FROM applications WHERE property_id = prop_id;
  DELETE FROM units WHERE property_id = prop_id;
  DELETE FROM property_amenities WHERE property_id = prop_id;
  DELETE FROM property_images WHERE property_id = prop_id;
  DELETE FROM expenses WHERE property_id = prop_id;
  DELETE FROM landlord_utility_questionnaires WHERE property_id = prop_id::text;
  
  -- Finally delete the property itself
  DELETE FROM properties WHERE id = prop_id;
END;
$$;

-- Add RLS policies for property management
CREATE POLICY "Property owners can manage their units" ON units
FOR ALL USING (
  property_id IN (
    SELECT id FROM properties WHERE landlord_id = auth.uid()
  )
);

CREATE POLICY "Property owners can manage applications" ON applications
FOR ALL USING (
  property_id IN (
    SELECT id FROM properties WHERE landlord_id = auth.uid()
  )
);

CREATE POLICY "Property owners can manage tenancies" ON tenancies
FOR ALL USING (landlord_id = auth.uid());

-- Enable RLS on tables if not already enabled
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;
