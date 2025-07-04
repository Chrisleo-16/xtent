
import { useState } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Control } from 'react-hook-form';
import { PropertyFormValues, amenityTypes } from '../types';

interface AmenitiesSectionProps {
  control: Control<PropertyFormValues>;
}

const AmenitiesSection = ({ control }: AmenitiesSectionProps) => {
  const [customAmenity, setCustomAmenity] = useState('');
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !customAmenities.includes(customAmenity.trim())) {
      const newAmenity = customAmenity.trim().toLowerCase().replace(/\s+/g, '_');
      setCustomAmenities([...customAmenities, newAmenity]);
      setCustomAmenity('');
    }
  };

  const removeCustomAmenity = (amenityToRemove: string) => {
    setCustomAmenities(customAmenities.filter(amenity => amenity !== amenityToRemove));
  };

  const formatAmenityDisplay = (amenity: string) => {
    return amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <FormField
        control={control}
        name="amenities"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold">Property Amenities</FormLabel>
              <FormDescription>
                Select all amenities available at your property. Don't see what you're looking for? Add custom amenities below.
              </FormDescription>
            </div>
            
            {/* Standard Amenities */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-700">Standard Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenityTypes.map((item) => (
                  <FormField
                    key={item}
                    control={control}
                    name="amenities"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 border rounded-lg p-3 hover:bg-white transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize flex-1 cursor-pointer">
                            {formatAmenityDisplay(item)}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Amenities */}
            <div className="mb-4">
              <h4 className="font-medium mb-3 text-gray-700">Add Custom Amenities</h4>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Enter custom amenity (e.g., Rooftop Terrace)"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addCustomAmenity}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Display Custom Amenities */}
              {customAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {customAmenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1"
                    >
                      {formatAmenityDisplay(amenity)}
                      <button
                        type="button"
                        onClick={() => removeCustomAmenity(amenity)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden field to include custom amenities in form submission */}
            <FormField
              control={control}  
              name="amenities"
              render={({ field }) => {
                // Merge standard and custom amenities
                const allAmenities = [...(field.value || []), ...customAmenities];
                const uniqueAmenities = [...new Set(allAmenities)];
                
                // Update the form field if custom amenities changed
                if (customAmenities.length > 0 && JSON.stringify(field.value) !== JSON.stringify(uniqueAmenities)) {
                  field.onChange(uniqueAmenities);
                }
                
                return <input type="hidden" />;
              }}
            />
            
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AmenitiesSection;
