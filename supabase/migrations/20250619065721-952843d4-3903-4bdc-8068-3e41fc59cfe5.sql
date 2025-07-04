
-- Create water_service_providers table
CREATE TABLE public.water_service_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  county text NOT NULL,
  coverage_areas text[] DEFAULT ARRAY[]::text[],
  contact_phone text,
  contact_email text,
  website text,
  paybill_number text,
  account_format text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert some sample water service providers for Kenya
INSERT INTO public.water_service_providers (name, code, county, coverage_areas) VALUES
('Nairobi City Water and Sewerage Company', 'NCWSC', 'Nairobi', ARRAY['Nairobi Central', 'Kasarani', 'Embakasi', 'Dagoretti']),
('Kiambu Water and Sewerage Company', 'KIWASCO', 'Kiambu', ARRAY['Kiambu Town', 'Thika', 'Ruiru']),
('Murang''a Water and Sanitation Company', 'MUWASCO', 'Murang''a', ARRAY['Murang''a Town', 'Kenol', 'Kandara']),
('Nyeri Water and Sewerage Company', 'NYWASCO', 'Nyeri', ARRAY['Nyeri Town', 'Karatina', 'Othaya']),
('Mombasa Water Supply and Sanitation Company', 'MOWASSCO', 'Mombasa', ARRAY['Mombasa Island', 'Likoni', 'Changamwe']);

-- Create landlord_utility_questionnaires table
CREATE TABLE public.landlord_utility_questionnaires (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id uuid NOT NULL,
  property_id text NOT NULL,
  water_billing_method text NOT NULL,
  water_service_provider_id uuid REFERENCES public.water_service_providers(id),
  water_shared_allocation_method text,
  water_bill_frequency text,
  water_additional_charges text[],
  electricity_billing_method text NOT NULL,
  electricity_provider text,
  electricity_shared_allocation_method text,
  electricity_token_management text,
  electricity_additional_charges text[],
  utilities_included_in_rent boolean DEFAULT false,
  included_utilities text[],
  extra_charges_in_rent text[],
  service_charge_amount integer,
  billing_cycle text NOT NULL,
  payment_due_day integer,
  late_payment_fee integer,
  advance_notice_days integer,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(landlord_id, property_id)
);

-- Create landlord utility questionnaire functions
CREATE OR REPLACE FUNCTION public.get_landlord_questionnaire(p_property_id text)
RETURNS SETOF public.landlord_utility_questionnaires
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.landlord_utility_questionnaires
  WHERE property_id = p_property_id AND landlord_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.upsert_landlord_questionnaire(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id uuid;
BEGIN
  INSERT INTO public.landlord_utility_questionnaires (
    landlord_id,
    property_id,
    water_billing_method,
    water_service_provider_id,
    water_shared_allocation_method,
    water_bill_frequency,
    water_additional_charges,
    electricity_billing_method,
    electricity_provider,
    electricity_shared_allocation_method,
    electricity_token_management,
    electricity_additional_charges,
    utilities_included_in_rent,
    included_utilities,
    extra_charges_in_rent,
    service_charge_amount,
    billing_cycle,
    payment_due_day,
    late_payment_fee,
    advance_notice_days,
    is_completed,
    completed_at
  ) VALUES (
    auth.uid(),
    p_data->>'property_id',
    p_data->>'water_billing_method',
    (p_data->>'water_service_provider_id')::uuid,
    p_data->>'water_shared_allocation_method',
    p_data->>'water_bill_frequency',
    ARRAY(SELECT jsonb_array_elements_text(p_data->'water_additional_charges')),
    p_data->>'electricity_billing_method',
    p_data->>'electricity_provider',
    p_data->>'electricity_shared_allocation_method',
    p_data->>'electricity_token_management',
    ARRAY(SELECT jsonb_array_elements_text(p_data->'electricity_additional_charges')),
    (p_data->>'utilities_included_in_rent')::boolean,
    ARRAY(SELECT jsonb_array_elements_text(p_data->'included_utilities')),
    ARRAY(SELECT jsonb_array_elements_text(p_data->'extra_charges_in_rent')),
    (p_data->>'service_charge_amount')::integer,
    p_data->>'billing_cycle',
    (p_data->>'payment_due_day')::integer,
    (p_data->>'late_payment_fee')::integer,
    (p_data->>'advance_notice_days')::integer,
    COALESCE((p_data->>'is_completed')::boolean, true),
    CASE WHEN (p_data->>'is_completed')::boolean THEN now() ELSE NULL END
  )
  ON CONFLICT (landlord_id, property_id) 
  DO UPDATE SET
    water_billing_method = EXCLUDED.water_billing_method,
    water_service_provider_id = EXCLUDED.water_service_provider_id,
    water_shared_allocation_method = EXCLUDED.water_shared_allocation_method,
    water_bill_frequency = EXCLUDED.water_bill_frequency,
    water_additional_charges = EXCLUDED.water_additional_charges,
    electricity_billing_method = EXCLUDED.electricity_billing_method,
    electricity_provider = EXCLUDED.electricity_provider,
    electricity_shared_allocation_method = EXCLUDED.electricity_shared_allocation_method,
    electricity_token_management = EXCLUDED.electricity_token_management,
    electricity_additional_charges = EXCLUDED.electricity_additional_charges,
    utilities_included_in_rent = EXCLUDED.utilities_included_in_rent,
    included_utilities = EXCLUDED.included_utilities,
    extra_charges_in_rent = EXCLUDED.extra_charges_in_rent,
    service_charge_amount = EXCLUDED.service_charge_amount,
    billing_cycle = EXCLUDED.billing_cycle,
    payment_due_day = EXCLUDED.payment_due_day,
    late_payment_fee = EXCLUDED.late_payment_fee,
    advance_notice_days = EXCLUDED.advance_notice_days,
    is_completed = EXCLUDED.is_completed,
    completed_at = EXCLUDED.completed_at,
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- Enable RLS
ALTER TABLE public.water_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_utility_questionnaires ENABLE ROW LEVEL SECURITY;

-- Create policies for water_service_providers (public read access)
CREATE POLICY "Anyone can view water service providers" 
  ON public.water_service_providers 
  FOR SELECT 
  USING (true);

-- Create policies for landlord_utility_questionnaires
CREATE POLICY "Landlords can view their own questionnaire" 
  ON public.landlord_utility_questionnaires 
  FOR SELECT 
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert their own questionnaire" 
  ON public.landlord_utility_questionnaires 
  FOR INSERT 
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update their own questionnaire" 
  ON public.landlord_utility_questionnaires 
  FOR UPDATE 
  USING (auth.uid() = landlord_id);

-- Set up realtime for dashboard updates
ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER TABLE public.leases REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.maintenance_requests REPLICA IDENTITY FULL;
ALTER TABLE public.tenant_invitations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_invitations;
