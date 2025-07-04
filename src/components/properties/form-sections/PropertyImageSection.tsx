
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { PropertyFormValues } from '../types';

interface PropertyImageSectionProps {
  control: Control<PropertyFormValues>;
}

const PropertyImageSection = ({ control }: PropertyImageSectionProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <FormField
        control={control}
        name="thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Property Image</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/property-image.jpg" {...field} />
            </FormControl>
            <FormDescription>
              Add a high-quality image URL of your property. Properties with images get 300% more views!
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PropertyImageSection;
