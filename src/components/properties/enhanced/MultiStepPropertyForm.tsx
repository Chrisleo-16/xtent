
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import StepProgress from './components/StepProgress';
import StepRenderer from './components/StepRenderer';
import LoadingState from './components/LoadingState';
import AuthGuard from './components/AuthGuard';
import PropertyFormNavigation from './components/PropertyFormNavigation';

import { usePropertyFormValidation } from './hooks/usePropertyFormValidation';
import { usePropertyFormSubmission } from './hooks/usePropertyFormSubmission';
import { usePropertyFormNavigation } from './hooks/usePropertyFormNavigation';

import { 
  createEnhancedPropertySchema, 
  EnhancedPropertyFormData, 
  MultiStepPropertyFormProps,
  FormStep 
} from './types/formTypes';

const MultiStepPropertyForm = ({ editMode = false, initialData, onSuccess }: MultiStepPropertyFormProps) => {
  const { user, isLoading: authLoading } = useAuth();

  const steps: FormStep[] = [
    { label: 'Basic Info' },
    { label: 'Location' },
    { label: 'Units' },
    { label: 'Media' },
    { label: 'Amenities' },
  ];

  const form = useForm<EnhancedPropertyFormData>({
    resolver: zodResolver(createEnhancedPropertySchema()),
    defaultValues: editMode && initialData ? {
      title: initialData.title || '',
      description: initialData.description || '',
      address: initialData.address || '',
      monthly_rent: initialData.monthly_rent || undefined,
      bedrooms: initialData.bedrooms || undefined,
      bathrooms: initialData.bathrooms || undefined,
      size_sqft: initialData.size_sqft || undefined,
      amenities: initialData.amenities || [],
      status: initialData.status || 'available',
      thumbnail_url: initialData.thumbnail_url || '',
      property_type_id: initialData.property_type_id || '',
      custom_type: initialData.custom_type || '',
      is_single_unit: initialData.is_single_unit || false,
      latitude: initialData.latitude || null,
      longitude: initialData.longitude || null,
      images: initialData.images || [],
      property_images: [],
      unit_configurations: [],
    } : {
      title: '',
      description: '',
      address: '',
      monthly_rent: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      size_sqft: undefined,
      amenities: [],
      status: 'available',
      thumbnail_url: '',
      property_type_id: '',
      custom_type: '',
      is_single_unit: false,
      latitude: null,
      longitude: null,
      images: [],
      property_images: [],
      unit_configurations: [],
    },
    mode: 'onChange',
  });

  const { isFormValid, isSingleUnit } = usePropertyFormValidation(form);
  const { handleFinalSubmit, isSubmitting } = usePropertyFormSubmission(form, editMode, onSuccess);
  const {
    currentStep,
    handleNext,
    handlePrevious,
  } = usePropertyFormNavigation(form, steps);

  // Show loading while auth is loading
  if (authLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <AuthGuard editMode={editMode} />;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">
          {editMode ? 'Edit Property' : 'List Your Property'}
        </CardTitle>
        <CardDescription>
          {editMode ? 'Update your property details' : 'Fill out the details to list your property on XTent'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StepProgress 
          steps={steps} 
          currentStep={currentStep} 
          isSingleUnit={isSingleUnit} 
        />

        <Form {...form}>
          <form className="space-y-8">
            <StepRenderer 
              currentStep={currentStep} 
              isSingleUnit={isSingleUnit} 
              form={form} 
            />
            
            <PropertyFormNavigation
              currentStep={currentStep}
              isSingleUnit={isSingleUnit}
              isSubmitting={isSubmitting}
              isFormValid={isFormValid()}
              editMode={editMode}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onFinalSubmit={handleFinalSubmit}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MultiStepPropertyForm;
