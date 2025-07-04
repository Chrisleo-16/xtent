
import { Steps } from '@/components/ui/steps';
import { FormStep } from '../types/formTypes';

interface StepProgressProps {
  steps: FormStep[];
  currentStep: number;
  isSingleUnit: boolean;
}

const StepProgress = ({ steps, currentStep, isSingleUnit }: StepProgressProps) => {
  // Filter steps for display based on single unit setting
  const getVisibleSteps = () => {
    return steps.filter((_, index) => {
      if (index === 2 && isSingleUnit) return false; // Hide Units step
      return true;
    });
  };

  // Adjust current step index for display
  const getDisplayCurrentStep = () => {
    return isSingleUnit && currentStep > 2 ? currentStep - 1 : 
           isSingleUnit && currentStep === 2 ? currentStep - 1 : currentStep;
  };

  const visibleSteps = getVisibleSteps();
  const displayCurrentStep = getDisplayCurrentStep();

  return (
    <Steps steps={visibleSteps.map((step, index) => ({
      ...step,
      active: index === displayCurrentStep,
      completed: index < displayCurrentStep,
    }))} />
  );
};

export default StepProgress;
