
export const amenityTypes = ['wifi', 'parking', 'swimming_pool', 'gym', 'balcony', 'lift', 'security', 'garden', 'laundry', 'water_tank'] as const;
export const propertyStatusTypes = ['available', 'occupied', 'maintenance', 'unavailable'] as const;

export type AmenityType = typeof amenityTypes[number];
export type PropertyStatusType = typeof propertyStatusTypes[number];

export interface PropertyFormValues {
  title: string;
  description: string;
  address: string;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  amenities: string[]; // Changed to string[] to allow custom amenities
  status: PropertyStatusType;
  thumbnail_url: string;
}
