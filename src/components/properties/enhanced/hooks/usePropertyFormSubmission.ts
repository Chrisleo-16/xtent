
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const usePropertyFormSubmission = (form: any, editMode: boolean = false, onSuccess?: () => void) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const submitPropertyMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Submitting property with data:', formData);

      try {
        // Create the property
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .insert({
            title: formData.title,
            description: formData.description,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            monthly_rent: formData.monthly_rent,
            property_type_id: formData.property_type_id,
            landlord_id: user.id,
            status: 'available',
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            size_sqft: formData.size_sqft,
            is_single_unit: formData.is_single_unit,
            custom_type: formData.custom_type
          })
          .select()
          .single();

        if (propertyError) throw propertyError;

        // Insert property amenities using junction table
        if (formData.amenities && formData.amenities.length > 0) {
          const amenityInserts = formData.amenities.map((amenityId: string) => ({
            property_id: property.id,
            amenity_id: amenityId
          }));

          const { error: amenitiesError } = await supabase
            .from('property_amenities')
            .insert(amenityInserts);

          if (amenitiesError) {
            console.error('Error inserting amenities:', amenitiesError);
            // Don't fail the entire operation for amenity errors
          }
        }

        // Insert property images if any
        if (formData.images && formData.images.length > 0) {
          const imageInserts = formData.images.map((imageUrl: string, index: number) => ({
            property_id: property.id,
            url: imageUrl,
            display_order: index,
            is_thumbnail: index === 0
          }));

          const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imageInserts);

          if (imagesError) {
            console.error('Error inserting images:', imagesError);
            // Don't fail the entire operation for image errors
          }
        }

        // Auto-generate individual units from unit configurations
        if (formData.unit_configurations && formData.unit_configurations.length > 0) {
          const unitInserts = [];
          
          for (const config of formData.unit_configurations) {
            // Only process valid configurations
            if (config.unit_type_id && config.quantity > 0) {
              // Get unit type name for generating unit numbers
              const { data: unitType } = await supabase
                .from('unit_types')
                .select('name')
                .eq('id', config.unit_type_id)
                .single();

              const unitTypeName = unitType?.name || 'Unit';

              // Generate individual units with enhanced fields
              for (let i = 1; i <= config.quantity; i++) {
                unitInserts.push({
                  property_id: property.id,
                  unit_type_id: config.unit_type_id,
                  unit_number: `${unitTypeName}-${i}`,
                  monthly_rent: config.monthly_rent,
                  rent_amount: config.monthly_rent,
                  bedrooms: config.bedrooms || 0,
                  bathrooms: config.bathrooms || 0,
                  status: 'vacant'
                });
              }
            }
          }

          if (unitInserts.length > 0) {
            const { error: unitsError } = await supabase
              .from('units')
              .insert(unitInserts);

            if (unitsError) {
              console.error('Error creating units:', unitsError);
              throw new Error('Failed to create property units');
            }

            console.log(`Created ${unitInserts.length} units for property ${property.id}`);
          }
        }

        return property;
      } catch (error) {
        console.error('Property submission error:', error);
        throw error;
      }
    },
    onSuccess: (property) => {
      toast.success('Property added successfully!');
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      queryClient.invalidateQueries({ queryKey: ['units', property.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/manage-property/${property.id}`);
      }
    },
    onError: (error) => {
      console.error('Property submission error:', error);
      toast.error(`Failed to add property: ${error.message}`);
    },
  });

  const handleFinalSubmit = () => {
    try {
      const formData = form.getValues();
      submitPropertyMutation.mutate(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Please check all required fields and try again.');
    }
  };

  return {
    submitProperty: submitPropertyMutation.mutate,
    handleFinalSubmit,
    isSubmitting: submitPropertyMutation.isPending,
  };
};
