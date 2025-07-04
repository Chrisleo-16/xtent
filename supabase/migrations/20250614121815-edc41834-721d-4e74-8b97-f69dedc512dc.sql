
-- Drop all existing tables and types
DROP TABLE IF EXISTS public.communications CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.leases CASCADE;
DROP TABLE IF EXISTS public.maintenance_requests CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS public.communication_type CASCADE;
DROP TYPE IF EXISTS public.lease_status CASCADE;
DROP TYPE IF EXISTS public.maintenance_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.property_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.amenity_type CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.generate_monthly_rent_payments() CASCADE;
DROP FUNCTION IF EXISTS public.user_has_role(uuid, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_primary_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('landlord', 'tenant', 'caretaker', 'vendor');
CREATE TYPE public.property_status AS ENUM ('available', 'occupied', 'maintenance', 'unavailable');
CREATE TYPE public.lease_status AS ENUM ('active', 'pending', 'expired', 'terminated', 'draft');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue', 'failed', 'refunded');
CREATE TYPE public.maintenance_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.communication_type AS ENUM ('message', 'complaint', 'maintenance_request', 'payment_reminder', 'notice');
CREATE TYPE public.amenity_type AS ENUM ('parking', 'gym', 'balcony', 'garden', 'swimming_pool', 'lift', 'security', 'wifi', 'laundry', 'water_tank');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'tenant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_roles table for multi-role support
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  size_sqft INTEGER,
  thumbnail_url TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities amenity_type[] DEFAULT ARRAY[]::amenity_type[],
  status property_status DEFAULT 'available',
  landlord_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create leases table
CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id),
  tenant_id UUID REFERENCES public.profiles(id),
  landlord_id UUID REFERENCES public.profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL,
  status lease_status DEFAULT 'draft',
  lease_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id),
  tenant_id UUID REFERENCES public.profiles(id),
  landlord_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'rent',
  payment_method TEXT,
  status payment_status DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date DATE,
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id),
  tenant_id UUID REFERENCES public.profiles(id),
  landlord_id UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status maintenance_status DEFAULT 'pending',
  estimated_cost INTEGER,
  actual_cost INTEGER,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communications table
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  property_id UUID REFERENCES public.properties(id),
  lease_id UUID REFERENCES public.leases(id),
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id),
  type communication_type DEFAULT 'message',
  subject TEXT,
  message TEXT NOT NULL,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id),
  landlord_id UUID REFERENCES public.profiles(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  vendor_name TEXT,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for properties (public read, landlords can manage their own)
CREATE POLICY "Anyone can view available properties" ON public.properties
  FOR SELECT USING (status = 'available' OR landlord_id = auth.uid());

CREATE POLICY "Landlords can manage their properties" ON public.properties
  FOR ALL USING (landlord_id = auth.uid());

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Create RLS policies for leases
CREATE POLICY "Users can view their own leases" ON public.leases
  FOR SELECT USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

CREATE POLICY "Landlords can manage their leases" ON public.leases
  FOR ALL USING (landlord_id = auth.uid());

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

CREATE POLICY "Users can manage their own payments" ON public.payments
  FOR ALL USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

-- Create RLS policies for maintenance requests
CREATE POLICY "Users can view relevant maintenance requests" ON public.maintenance_requests
  FOR SELECT USING (tenant_id = auth.uid() OR landlord_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can manage relevant maintenance requests" ON public.maintenance_requests
  FOR ALL USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

-- Create RLS policies for communications
CREATE POLICY "Users can view their communications" ON public.communications
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send communications" ON public.communications
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Create RLS policies for expenses
CREATE POLICY "Landlords can view their expenses" ON public.expenses
  FOR SELECT USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can manage their expenses" ON public.expenses
  FOR ALL USING (landlord_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create utility functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'tenant'::public.user_role)
  );

  -- Insert primary role
  INSERT INTO public.user_roles (user_id, role, is_primary)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'tenant'::public.user_role),
    TRUE
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_primary = TRUE
  LIMIT 1
$$;

-- Create function to generate monthly rent payments
CREATE OR REPLACE FUNCTION public.generate_monthly_rent_payments()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate rent payments for active leases
  INSERT INTO public.payments (lease_id, tenant_id, landlord_id, amount, payment_type, due_date)
  SELECT 
    l.id,
    l.tenant_id,
    l.landlord_id,
    l.monthly_rent,
    'rent',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'
  FROM public.leases l
  WHERE l.status = 'active'
    AND l.end_date >= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.lease_id = l.id 
        AND p.payment_type = 'rent'
        AND p.due_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND p.due_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    );
END;
$$;

-- Insert sample properties for testing
INSERT INTO public.properties (title, description, address, monthly_rent, bedrooms, bathrooms, size_sqft, amenities, landlord_id) VALUES
('Modern 2BR Apartment in Westlands', 'Beautiful modern apartment with city views', 'Westlands, Nairobi', 75000, 2, 2, 1200, ARRAY['parking', 'security', 'wifi']::amenity_type[], NULL),
('Cozy 1BR in Kilimani', 'Perfect for young professionals', 'Kilimani, Nairobi', 45000, 1, 1, 800, ARRAY['security', 'wifi']::amenity_type[], NULL),
('Spacious 3BR House in Karen', 'Family home with garden', 'Karen, Nairobi', 120000, 3, 3, 2000, ARRAY['parking', 'garden', 'security']::amenity_type[], NULL),
('Studio Apartment in CBD', 'Convenient location in city center', 'CBD, Nairobi', 35000, 0, 1, 500, ARRAY['security', 'wifi']::amenity_type[], NULL),
('Luxury 4BR Villa in Runda', 'High-end home with all amenities', 'Runda, Nairobi', 200000, 4, 4, 3000, ARRAY['parking', 'garden', 'swimming_pool', 'security', 'wifi']::amenity_type[], NULL);
