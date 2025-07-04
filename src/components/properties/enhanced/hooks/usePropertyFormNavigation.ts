
import { useState } from 'react';
import { toast } from 'sonner';
import { usePropertyFormValidation } from './usePropertyFormValidation';
import { FormStep } from '../types/formTypes';

export const usePropertyFormNavigation = (form: any, steps: FormStep[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { validateCurrentStep, isSingleUnit } = usePropertyFormValidation(form);

  const getNextStep = (current: number) => {
    // Skip Units step (index 2) if single unit
    if (current === 1 && isSingleUnit) {
      return 3; // Skip to Media step
    }
    return current + 1;
  };

  const getPreviousStep = (current: number) => {
    // Skip Units step (index 2) when going backwards if single unit
    if (current === 3 && isSingleUnit) {
      return 1; // Go back to Location step
    }
    return current - 1;
  };

  const handleNext = () => {
    const validationErrors = validateCurrentStep(currentStep);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    const nextStep = getNextStep(currentStep);
    setCurrentStep(Math.min(nextStep, steps.length - 1));
  };

  const handlePrevious = () => {
    const prevStep = getPreviousStep(currentStep);
    setCurrentStep(Math.max(prevStep, 0));
  };

  return {
    currentStep,
    setCurrentStep,
    handleNext,
    handlePrevious,
  };
};
