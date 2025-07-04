
-- Create property_types table
CREATE TABLE public.property_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create unit_types table
CREATE TABLE public.unit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_occupancy INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_type_id UUID REFERENCES public.unit_types(id) NOT NULL,
  unit_number TEXT NOT NULL,
  status TEXT DEFAULT 'vacant',
  monthly_rent INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, unit_number)
);

-- Create amenities table
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create property_amenities junction table
CREATE TABLE public.property_amenities (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (property_id, amenity_id)
);

-- Create property_images table
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_thumbnail BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to properties table
ALTER TABLE public.properties 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN property_type_id UUID REFERENCES public.property_types(id),
ADD COLUMN custom_type TEXT,
ADD COLUMN is_single_unit BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_types and unit_types (public read access)
CREATE POLICY "Anyone can view property types" ON public.property_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view unit types" ON public.unit_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view amenities" ON public.amenities FOR SELECT USING (true);

-- RLS Policies for units (landlord ownership)
CREATE POLICY "Landlords can view their property units" ON public.units 
FOR SELECT USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

CREATE POLICY "Landlords can create units for their properties" ON public.units 
FOR INSERT WITH CHECK (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

CREATE POLICY "Landlords can update their property units" ON public.units 
FOR UPDATE USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

CREATE POLICY "Landlords can delete their property units" ON public.units 
FOR DELETE USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

-- RLS Policies for property_amenities
CREATE POLICY "Landlords can view their property amenities" ON public.property_amenities 
FOR SELECT USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

CREATE POLICY "Landlords can manage their property amenities" ON public.property_amenities 
FOR ALL USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

-- RLS Policies for property_images
CREATE POLICY "Landlords can view their property images" ON public.property_images 
FOR SELECT USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

CREATE POLICY "Landlords can manage their property images" ON public.property_images 
FOR ALL USING (
  property_id IN (SELECT id FROM public.properties WHERE landlord_id = auth.uid())
);

-- Seed data for property_types
INSERT INTO public.property_types (name, description) VALUES
('Apartment', 'Multi-unit residential building'),
('House', 'Single-family detached home'),
('Townhouse', 'Multi-story attached home'),
('Condo', 'Individually owned unit in a building'),
('Studio', 'Single room living space'),
('Duplex', 'Two-unit residential building'),
('Commercial', 'Business or office space'),
('Other', 'Custom property type');

-- Seed data for unit_types
INSERT INTO public.unit_types (name, description, max_occupancy) VALUES
('Studio', 'Single room with kitchenette', 2),
('1-Bedroom', 'One bedroom apartment', 3),
('2-Bedroom', 'Two bedroom apartment', 5),
('3-Bedroom', 'Three bedroom apartment', 7),
('4-Bedroom', 'Four bedroom apartment', 9),
('Penthouse', 'Luxury top-floor unit', 8),
('Loft', 'Open-plan converted space', 4),
('Custom', 'Custom unit configuration', NULL);

-- Seed data for amenities
INSERT INTO public.amenities (name, description, icon, category) VALUES
('Parking', 'Dedicated parking space', 'car', 'parking'),
('Swimming Pool', 'Community swimming pool', 'waves', 'recreation'),
('Gym/Fitness Center', 'On-site fitness facilities', 'dumbbell', 'recreation'),
('Security', '24/7 security service', 'shield', 'security'),
('Elevator', 'Building elevator access', 'move-vertical', 'building'),
('Air Conditioning', 'Central or unit AC', 'snowflake', 'climate'),
('Balcony/Terrace', 'Private outdoor space', 'sun', 'outdoor'),
('Laundry', 'In-unit or shared laundry', 'shirt', 'utilities'),
('Internet/WiFi', 'High-speed internet included', 'wifi', 'utilities'),
('Garden/Yard', 'Private or shared garden space', 'trees', 'outdoor'),
('Pet Friendly', 'Pets allowed', 'heart', 'lifestyle'),
('Furnished', 'Fully furnished unit', 'sofa', 'lifestyle'),
('Kitchenette', 'Basic cooking facilities', 'chef-hat', 'kitchen'),
('Full Kitchen', 'Complete kitchen with appliances', 'utensils', 'kitchen'),
('Storage', 'Additional storage space', 'package', 'storage');

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Storage policies for property images
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Landlords can delete their property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND
  auth.role() = 'authenticated'
);
