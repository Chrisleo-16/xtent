
-- Phase 1: Database Schema Updates

-- 1. Remove the enum array column from properties table (if it exists as enum array)
ALTER TABLE properties DROP COLUMN IF EXISTS amenities;

-- 2. Ensure property_amenities junction table exists and is properly structured
CREATE TABLE IF NOT EXISTS property_amenities (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (property_id, amenity_id)
);

-- 3. Add missing columns to units table
ALTER TABLE units 
ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rent_amount INTEGER;

-- 4. Ensure applications table has required columns for enhanced flow
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS preferred_move_in_date DATE,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS monthly_income INTEGER;

-- 5. Add RLS policies for property_amenities junction table
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property amenities" ON property_amenities
  FOR SELECT USING (true);

CREATE POLICY "Landlords can manage property amenities" ON property_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_amenities.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

-- 6. Add communication channels table for tenant-landlord messaging
CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, tenant_id, landlord_id)
);

ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their communication channels" ON communication_channels
  FOR SELECT USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );

CREATE POLICY "Users can create communication channels" ON communication_channels
  FOR INSERT WITH CHECK (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );
