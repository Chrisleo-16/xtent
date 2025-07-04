
-- Create calendar_events table for storing all calendar events
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  event_type TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  property_id UUID,
  tenant_id UUID,
  maintenance_request_id UUID,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  recurring_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_calendar_events_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_calendar_events_tenant FOREIGN KEY (tenant_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_calendar_events_maintenance FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own events or property-related events" ON public.calendar_events
  FOR SELECT USING (
    user_id = auth.uid() OR
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    ) OR
    tenant_id = auth.uid() OR
    property_id IN (
      SELECT property_id FROM tenancies WHERE tenant_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own events" ON public.calendar_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own events or property events they manage" ON public.calendar_events
  FOR UPDATE USING (
    user_id = auth.uid() OR
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own events or property events they manage" ON public.calendar_events
  FOR DELETE USING (
    user_id = auth.uid() OR
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_property_id ON public.calendar_events(property_id);
CREATE INDEX idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX idx_calendar_events_event_type ON public.calendar_events(event_type);

-- Create a function to auto-generate rent due events for active tenancies
CREATE OR REPLACE FUNCTION public.create_rent_due_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate rent due events for active tenancies
  INSERT INTO public.calendar_events (
    user_id, title, description, start_date, event_type, priority, property_id, tenant_id, is_recurring, recurring_frequency
  )
  SELECT 
    t.landlord_id,
    'Rent Due - ' || p.title || ' Unit ' || u.unit_number,
    'Monthly rent collection for tenant: ' || pr.name,
    DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') + INTERVAL '1 day',
    'rent',
    'high',
    t.property_id,
    t.tenant_id,
    TRUE,
    'monthly'
  FROM tenancies t
  JOIN properties p ON t.property_id = p.id
  JOIN units u ON t.unit_id = u.id
  JOIN profiles pr ON t.tenant_id = pr.id
  WHERE t.status = 'active'
    AND t.lease_end_date >= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM calendar_events ce 
      WHERE ce.property_id = t.property_id 
        AND ce.tenant_id = t.tenant_id 
        AND ce.event_type = 'rent'
        AND ce.start_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND ce.start_date < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
    );
END;
$$;
