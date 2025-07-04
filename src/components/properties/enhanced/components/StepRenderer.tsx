
import { UseFormReturn } from 'react-hook-form';
import BasicInfoStep from '../steps/BasicInfoStep';
import LocationStep from '../steps/LocationStep';
import UnitsStep from '../steps/UnitsStep';
import MediaStep from '../steps/MediaStep';
import AmenitiesStep from '../steps/AmenitiesStep';
import { EnhancedPropertyFormData } from '../types/formTypes';

interface StepRendererProps {
  currentStep: number;
  isSingleUnit: boolean;
  form: UseFormReturn<EnhancedPropertyFormData>;
}

const StepRenderer = ({ currentStep, isSingleUnit, form }: StepRendererProps) => {
  if (currentStep === 0) {
    return <BasicInfoStep form={form} />;
  }
  
  if (currentStep === 1) {
    return <LocationStep form={form} />;
  }
  
  if (currentStep === 2 && !isSingleUnit) {
    return <UnitsStep form={form} />;
  }
  
  if ((currentStep === 3 && !isSingleUnit) || (currentStep === 2 && isSingleUnit)) {
    return <MediaStep form={form} />;
  }
  
  if ((currentStep === 4 && !isSingleUnit) || (currentStep === 3 && isSingleUnit)) {
    return <AmenitiesStep form={form} />;
  }
  
  return null;
};

export default StepRenderer;
