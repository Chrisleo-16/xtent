
-- Create communications table for chat functionality
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message TEXT NOT NULL,
  subject TEXT,
  type communication_type DEFAULT 'message',
  property_id UUID,
  lease_id UUID,
  maintenance_request_id UUID,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create communication_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE communication_type AS ENUM ('message', 'notification', 'maintenance_update', 'payment_reminder');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enable RLS on communications
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Policies for communications
CREATE POLICY "Users can view their own messages" 
  ON public.communications 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
  ON public.communications 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
  ON public.communications 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Enable RLS on maintenance_requests if not already enabled
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Policies for maintenance_requests
CREATE POLICY "Landlords can view all maintenance requests for their properties" 
  ON public.maintenance_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = maintenance_requests.property_id 
      AND p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view their own maintenance requests" 
  ON public.maintenance_requests 
  FOR SELECT 
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create maintenance requests" 
  ON public.maintenance_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can update maintenance requests for their properties" 
  ON public.maintenance_requests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = maintenance_requests.property_id 
      AND p.landlord_id = auth.uid()
    )
  );

-- Create user_preferences table for settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  payment_reminders BOOLEAN DEFAULT true,
  maintenance_updates BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'KES',
  timezone TEXT DEFAULT 'Africa/Nairobi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to automatically create user preferences on profile creation
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create preferences when a profile is created
DROP TRIGGER IF EXISTS create_preferences_on_profile_creation ON public.profiles;
CREATE TRIGGER create_preferences_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_preferences();
