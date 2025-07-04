
import * as z from 'zod';

export const unitConfigurationSchema = z.object({
  unit_type_id: z.string().min(1, 'Unit type is required'),
  unit_type_name: z.string(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
});

// Create conditional schema that adapts based on is_single_unit
export const createEnhancedPropertySchema = () => z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  address: z.string().min(10, 'Address must be at least 10 characters.'),
  monthly_rent: z.coerce.number().int().optional(),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms cannot be negative.').optional(),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms cannot be negative.').optional(),
  size_sqft: z.coerce.number().int().positive('Size must be a positive number.').optional(),
  amenities: z.array(z.string()).default([]),
  status: z.enum(['available', 'occupied', 'maintenance', 'unavailable']).default('available'),
  thumbnail_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  property_type_id: z.string().uuid({ message: "Please select a valid property type." }),
  custom_type: z.string().optional(),
  is_single_unit: z.boolean().default(false),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  images: z.array(z.string()).default([]),
  property_images: z.array(z.any()).default([]), // For File objects during upload
  unit_configurations: z.array(unitConfigurationSchema).default([]),
}).refine((data) => {
  // Fixed validation: if single unit, require these fields
  if (data.is_single_unit) {
    return data.monthly_rent && data.monthly_rent > 0 && data.size_sqft && data.size_sqft > 0;
  }
  return true;
}, {
  message: "Monthly rent and size are required for single-unit properties",
  path: ["monthly_rent"]
});

export type EnhancedPropertyFormData = z.infer<ReturnType<typeof createEnhancedPropertySchema>>;

export interface MultiStepPropertyFormProps {
  editMode?: boolean;
  initialData?: any;
  onSuccess?: () => void;
}

export interface FormStep {
  label: string;
}
