
-- Create utility bills table for main WSP/KPLC bills
CREATE TABLE public.utility_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  landlord_id UUID REFERENCES public.profiles(id) NOT NULL,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('water', 'electricity')),
  provider_name TEXT NOT NULL, -- e.g., 'Nairobi Water', 'KPLC'
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  total_amount INTEGER NOT NULL, -- in cents (KES)
  total_units_consumed DECIMAL(10,2), -- cubic meters for water, kWh for electricity
  bill_reference TEXT, -- WSP/KPLC reference number
  bill_image_url TEXT, -- uploaded bill photo
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility meters table for sub-meter readings
CREATE TABLE public.utility_meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  unit_identifier TEXT NOT NULL, -- unit number or identifier
  tenant_id UUID REFERENCES public.profiles(id),
  utility_type TEXT NOT NULL CHECK (utility_type IN ('water', 'electricity')),
  meter_number TEXT,
  previous_reading DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_reading DECIMAL(10,2) NOT NULL DEFAULT 0,
  reading_date DATE NOT NULL,
  reading_image_url TEXT, -- photo of meter reading
  units_consumed DECIMAL(10,2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant utility allocations table
CREATE TABLE public.tenant_utility_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  utility_bill_id UUID REFERENCES public.utility_bills(id) NOT NULL,
  tenant_id UUID REFERENCES public.profiles(id) NOT NULL,
  unit_identifier TEXT NOT NULL,
  allocation_method TEXT NOT NULL CHECK (allocation_method IN ('sub_meter', 'equal_split', 'fixed_rate')),
  units_consumed DECIMAL(10,2), -- actual consumption if sub-metered
  allocation_percentage DECIMAL(5,2), -- percentage of total bill
  allocated_amount INTEGER NOT NULL, -- in cents (KES)
  due_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring bills table for other utilities (WiFi, garbage, etc.)
CREATE TABLE public.recurring_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  property_id UUID REFERENCES public.properties(id),
  bill_name TEXT NOT NULL,
  bill_category TEXT NOT NULL, -- 'internet', 'garbage', 'security', 'tv', 'gas', 'custom'
  amount INTEGER NOT NULL, -- in cents (KES)
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
  next_due_date DATE NOT NULL,
  auto_pay_enabled BOOLEAN DEFAULT false,
  vendor_paybill TEXT, -- M-Pesa paybill number
  vendor_account TEXT, -- account number for paybill
  is_shared BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared bill splits table for roommate cost sharing
CREATE TABLE public.shared_bill_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_bill_id UUID REFERENCES public.recurring_bills(id) NOT NULL,
  tenant_id UUID REFERENCES public.profiles(id) NOT NULL,
  split_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  allocated_amount INTEGER NOT NULL, -- in cents (KES)
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility payments table
CREATE TABLE public.utility_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) NOT NULL,
  utility_allocation_id UUID REFERENCES public.tenant_utility_allocations(id),
  recurring_bill_id UUID REFERENCES public.recurring_bills(id),
  shared_bill_split_id UUID REFERENCES public.shared_bill_splits(id),
  amount INTEGER NOT NULL, -- in cents (KES)
  payment_method TEXT DEFAULT 'mpesa',
  transaction_reference TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_utility_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for utility_bills (landlords can manage their property bills)
CREATE POLICY "Landlords can manage utility bills for their properties"
  ON public.utility_bills
  FOR ALL
  USING (landlord_id = auth.uid());

-- RLS Policies for utility_meters (landlords and tenants can view relevant meters)
CREATE POLICY "Landlords can manage meters for their properties"
  ON public.utility_meters
  FOR ALL
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view their own meter readings"
  ON public.utility_meters
  FOR SELECT
  USING (tenant_id = auth.uid());

-- RLS Policies for tenant_utility_allocations
CREATE POLICY "Tenants can view their own utility allocations"
  ON public.tenant_utility_allocations
  FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can manage utility allocations for their properties"
  ON public.tenant_utility_allocations
  FOR ALL
  USING (
    utility_bill_id IN (
      SELECT id FROM public.utility_bills WHERE landlord_id = auth.uid()
    )
  );

-- RLS Policies for recurring_bills
CREATE POLICY "Users can manage their own recurring bills"
  ON public.recurring_bills
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for shared_bill_splits
CREATE POLICY "Tenants can view their own bill splits"
  ON public.shared_bill_splits
  FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "Bill owners can manage splits for their bills"
  ON public.shared_bill_splits
  FOR ALL
  USING (
    recurring_bill_id IN (
      SELECT id FROM public.recurring_bills WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for utility_payments
CREATE POLICY "Tenants can view their own utility payments"
  ON public.utility_payments
  FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can create their own utility payments"
  ON public.utility_payments
  FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_utility_bills_property_landlord ON public.utility_bills(property_id, landlord_id);
CREATE INDEX idx_utility_meters_property_tenant ON public.utility_meters(property_id, tenant_id);
CREATE INDEX idx_tenant_allocations_tenant ON public.tenant_utility_allocations(tenant_id);
CREATE INDEX idx_recurring_bills_user ON public.recurring_bills(user_id);
CREATE INDEX idx_utility_payments_tenant ON public.utility_payments(tenant_id);
