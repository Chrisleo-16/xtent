
import { UseFormReturn } from 'react-hook-form';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BasicInfoStepProps {
  form: UseFormReturn<any>;
}

const BasicInfoStep = ({ form }: BasicInfoStepProps) => {
  const { data: propertyTypes = [], isLoading, error, retry } = usePropertyTypes();

  const selectedPropertyType = form.watch('property_type_id');
  const isSingleUnit = form.watch('is_single_unit');
  const isOtherType = propertyTypes.find(type => type.id === selectedPropertyType)?.name === 'Other';

  const handleRetryPropertyTypes = () => {
    console.log('Retrying property types fetch...');
    retry();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Sunset Apartments, Green Valley Townhouses"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your property, its features, and what makes it special..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="property_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type *</FormLabel>
                {error ? (
                  <div className="space-y-2">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load property types. Please try again.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleRetryPropertyTypes}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Loading Property Types
                    </Button>
                  </div>
                ) : (
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading..." : "Select property type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading property types...</span>
                          </div>
                        </SelectItem>
                      ) : propertyTypes.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          <div className="text-gray-500">
                            No property types available
                          </div>
                        </SelectItem>
                      ) : (
                        propertyTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div>
                              <div className="font-medium">{type.name}</div>
                              {type.description && (
                                <div className="text-sm text-gray-500">{type.description}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {isOtherType && (
            <FormField
              control={form.control}
              name="custom_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Property Type *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe your property type"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="is_single_unit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Single Unit Property
                  </FormLabel>
                  <div className="text-sm text-gray-600">
                    Check this if your property has only one rentable unit (like a single house or apartment)
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* Show these fields ONLY for single unit properties */}
          {isSingleUnit && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Single Unit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="monthly_rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rent (KES) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="size_sqft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size (Square Feet) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {!isSingleUnit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 font-medium">🏢 Multi-Unit Property</div>
              </div>
              <div className="text-sm text-blue-700 mt-2">
                <p>You'll configure individual unit types and quantities in the next step. Each unit can have different rent amounts and specifications.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoStep;
