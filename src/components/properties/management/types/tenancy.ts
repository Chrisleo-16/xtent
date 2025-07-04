
export interface TenantProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Unit {
  id: string;
  unit_number: string;
  unit_type: {
    name: string;
  } | null;
}

export interface TenancyWithTenant {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  landlord_id: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  security_deposit: number;
  lease_terms: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenant: TenantProfile | null;
  unit: Unit | null;
}
