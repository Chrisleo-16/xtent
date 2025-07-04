
import { Button } from '@/components/ui/button';

interface PropertyFormNavigationProps {
  currentStep: number;
  isSingleUnit: boolean;
  isSubmitting: boolean;
  isFormValid: boolean;
  editMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinalSubmit: () => void;
}

const PropertyFormNavigation = ({
  currentStep,
  isSingleUnit,
  isSubmitting,
  isFormValid,
  editMode,
  onPrevious,
  onNext,
  onFinalSubmit,
}: PropertyFormNavigationProps) => {
  // Determine if this is the last step
  const maxStep = isSingleUnit ? 3 : 4; // Skip Units step (index 2) for single unit
  const isLastStep = currentStep >= maxStep;

  return (
    <div className="flex justify-between pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isSubmitting}
      >
        Previous
      </Button>
      
      <div className="flex space-x-2">
        {!isLastStep ? (
          <Button
            type="button"
            onClick={onNext}
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onFinalSubmit}
            disabled={isSubmitting || !isFormValid}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
            aria-label={editMode ? "Update Property" : "Add Property"}
          >
            {isSubmitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Property' : 'Add Property')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PropertyFormNavigation;
