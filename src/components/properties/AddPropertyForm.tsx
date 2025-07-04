
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';

import BasicInformationSection from './form-sections/BasicInformationSection';
import PropertyDetailsSection from './form-sections/PropertyDetailsSection';
import AmenitiesSection from './form-sections/AmenitiesSection';
import PropertyImageSection from './form-sections/PropertyImageSection';
import ListingSuccessTips from './form-sections/ListingSuccessTips';
import { PropertyFormValues, propertyStatusTypes, PropertyStatusType } from './types';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  address: z.string().min(10, 'Address must be at least 10 characters.'),
  monthly_rent: z.coerce.number().int().positive('Rent must be a positive number.'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms cannot be negative.'),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms cannot be negative.'),
  size_sqft: z.coerce.number().int().positive('Size must be a positive number.'),
  amenities: z.array(z.string()).default([]),
  status: z.enum(propertyStatusTypes),
  thumbnail_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const createProperty = async (values: PropertyFormValues & { landlord_id: string }) => {
    console.log('Creating property with values:', values);
    
    try {
        const propertyToInsert = {
            title: values.title,
            description: values.description,
            address: values.address,
            monthly_rent: values.monthly_rent,
            bedrooms: values.bedrooms,
            bathrooms: values.bathrooms,
            size_sqft: values.size_sqft,
            amenities: values.amenities as any,
            status: values.status as PropertyStatusType,
            thumbnail_url: values.thumbnail_url || null,
            landlord_id: values.landlord_id,
        };

        const { data, error } = await supabase.from('properties').insert(propertyToInsert).select();
        
        if (error) {
            console.error("Error creating property:", error);
            throw new Error(error.message);
        }
        
        console.log('Property created successfully:', data);
        return data;
    } catch (error) {
        console.error('Create property error:', error);
        throw error;
    }
};

const AddPropertyForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    console.log('AddPropertyForm rendering, user:', user?.id);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: '',
            description: '',
            address: '',
            monthly_rent: 0,
            bedrooms: 0,
            bathrooms: 0,
            size_sqft: 0,
            amenities: [],
            status: 'available',
            thumbnail_url: '',
        },
        mode: 'onChange',
    });

    const mutation = useMutation({
        mutationFn: createProperty,
        onSuccess: (data) => {
            console.log('Property creation success:', data);
            toast.success('Property created successfully! Your listing is now live.');
            queryClient.invalidateQueries({ queryKey: ['landlordProperties', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
            
            if (data && data[0]) {
                navigate(`/property/${data[0].id}`);
            } else {
                navigate('/landlord-dashboard');
            }
        },
        onError: (error) => {
            console.error('Property creation error:', error);
            toast.error(`Failed to create property: ${error.message}`);
        }
    });

    const onSubmit = (values: PropertyFormValues) => {
        console.log('Form submission started with values:', values);
        
        if (!user) {
            console.error('No user found for property creation');
            toast.error('You must be logged in to create a property.');
            return;
        }
        
        try {
            mutation.mutate({ ...values, landlord_id: user.id });
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('An error occurred while submitting the form.');
        }
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <p>You must be logged in to create a property.</p>
                        <Button onClick={() => navigate('/auth')} className="mt-4">
                            Go to Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <ListingSuccessTips />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <BasicInformationSection control={form.control} />
                        <PropertyDetailsSection control={form.control} />
                        <AmenitiesSection control={form.control} />
                        <PropertyImageSection control={form.control} />

                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => navigate('/landlord-dashboard')}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={mutation.isPending} 
                                className="bg-green-600 hover:bg-green-700 min-w-[120px]"
                            >
                                {mutation.isPending ? 'Creating...' : 'List Property'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default AddPropertyForm;
