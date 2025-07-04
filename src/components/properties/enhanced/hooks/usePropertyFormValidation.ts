
import { UseFormReturn } from 'react-hook-form';

export const usePropertyFormValidation = (form: UseFormReturn<any>) => {
  const isSingleUnit = form.watch('is_single_unit');

  const isFormValid = () => {
    const values = form.getValues();
    
    // Basic info validation
    if (!values.title || values.title.length < 5) return false;
    if (!values.description || values.description.length < 10) return false;
    if (!values.property_type_id) return false;
    
    // Location validation
    if (!values.latitude || !values.longitude) return false;
    
    // Single unit specific validation
    if (values.is_single_unit) {
      if (!values.monthly_rent || values.monthly_rent <= 0) return false;
      if (!values.size_sqft || values.size_sqft <= 0) return false;
    } else {
      // Multi-unit validation
      if (!values.unit_configurations || values.unit_configurations.length === 0) return false;
    }
    
    return true;
  };

  const validateCurrentStep = (currentStep: number) => {
    if (currentStep === 0) {
      // Validate basic info step
      const title = form.getValues('title');
      const description = form.getValues('description');
      const propertyTypeId = form.getValues('property_type_id');
      
      const validationErrors = [];
      
      if (!title || title.length < 5) {
        validationErrors.push('Property title must be at least 5 characters');
      }
      
      if (!description || description.length < 10) {
        validationErrors.push('Property description must be at least 10 characters');
      }
      
      if (!propertyTypeId) {
        validationErrors.push('Please select a property type');
      }
      
      // For single unit properties, validate required fields
      if (isSingleUnit) {
        const monthlyRent = form.getValues('monthly_rent');
        const sizeSqft = form.getValues('size_sqft');
        
        if (!monthlyRent || monthlyRent <= 0) {
          validationErrors.push('Monthly rent is required for single-unit properties');
        }
        
        if (!sizeSqft || sizeSqft <= 0) {
          validationErrors.push('Property size is required for single-unit properties');
        }
      }
      
      return validationErrors;
    }
    
    if (currentStep === 1) {
      const latitude = form.getValues('latitude');
      const longitude = form.getValues('longitude');
      if (!latitude || !longitude) {
        return ['Please select a location on the map'];
      }
    }
    
    return [];
  };

  return {
    isFormValid,
    validateCurrentStep,
    isSingleUnit,
  };
};
