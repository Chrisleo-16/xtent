
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { PropertyFormValues } from '../types';

interface BasicInformationSectionProps {
  control: Control<PropertyFormValues>;
}

const BasicInformationSection = ({ control }: BasicInformationSectionProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Modern 2-Bedroom Apartment in Kilimani" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Kilimani Road, Nairobi, Kenya" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="mt-6">
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your property in detail. Include nearby amenities, transport links, and what makes it special..." 
                  className="resize-y min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicInformationSection;
