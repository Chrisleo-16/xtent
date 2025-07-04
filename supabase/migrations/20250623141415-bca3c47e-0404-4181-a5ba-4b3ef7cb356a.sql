
-- Create role-specific settings tables
CREATE TABLE public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Rental & Payment Settings
  payment_reminder_days INTEGER DEFAULT 7,
  auto_pay_enabled BOOLEAN DEFAULT false,
  payment_method_preference TEXT DEFAULT 'mpesa',
  
  -- Maintenance Settings
  maintenance_priority_notifications BOOLEAN DEFAULT true,
  maintenance_photo_required BOOLEAN DEFAULT true,
  
  -- Communication Settings
  landlord_message_notifications BOOLEAN DEFAULT true,
  community_announcements BOOLEAN DEFAULT true,
  
  -- Rental Credit Settings
  enable_rent_credit BOOLEAN DEFAULT false,
  credit_limit_amount INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE TABLE public.landlord_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Property Management Settings
  default_lease_term_months INTEGER DEFAULT 12,
  auto_generate_invoices BOOLEAN DEFAULT true,
  late_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
  grace_period_days INTEGER DEFAULT 3,
  
  -- Tenant Management Settings
  require_tenant_verification BOOLEAN DEFAULT true,
  auto_approve_maintenance BOOLEAN DEFAULT false,
  maintenance_budget_limit INTEGER DEFAULT 50000,
  
  -- Reporting Settings
  monthly_report_enabled BOOLEAN DEFAULT true,
  financial_report_day INTEGER DEFAULT 1,
  tax_document_format TEXT DEFAULT 'pdf',
  
  -- Communication Settings
  tenant_message_notifications BOOLEAN DEFAULT true,
  maintenance_request_alerts BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant_settings
CREATE POLICY "Users can view own tenant settings" 
  ON public.tenant_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tenant settings" 
  ON public.tenant_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tenant settings" 
  ON public.tenant_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for landlord_settings
CREATE POLICY "Users can view own landlord settings" 
  ON public.landlord_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own landlord settings" 
  ON public.landlord_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own landlord settings" 
  ON public.landlord_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to initialize role-specific settings
CREATE OR REPLACE FUNCTION public.create_role_specific_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create tenant settings if user has tenant role
  IF NEW.role = 'tenant' THEN
    INSERT INTO public.tenant_settings (user_id) 
    VALUES (NEW.id) 
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create landlord settings if user has landlord role
  IF NEW.role = 'landlord' THEN
    INSERT INTO public.landlord_settings (user_id) 
    VALUES (NEW.id) 
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create role-specific settings
CREATE TRIGGER create_role_settings_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_role_specific_settings();

-- Enable realtime for settings tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.landlord_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;

-- Set replica identity for realtime
ALTER TABLE public.tenant_settings REPLICA IDENTITY FULL;
ALTER TABLE public.landlord_settings REPLICA IDENTITY FULL;
ALTER TABLE public.user_preferences REPLICA IDENTITY FULL;
