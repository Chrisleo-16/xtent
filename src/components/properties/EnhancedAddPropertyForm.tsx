
import MultiStepPropertyForm from './enhanced/MultiStepPropertyForm';

interface EnhancedAddPropertyFormProps {
  editMode?: boolean;
  initialData?: any;
  onSuccess?: () => void;
}

const EnhancedAddPropertyForm = ({ editMode, initialData, onSuccess }: EnhancedAddPropertyFormProps) => {
  return (
    <MultiStepPropertyForm 
      editMode={editMode}
      initialData={initialData}
      onSuccess={onSuccess}
    />
  );
};

export default EnhancedAddPropertyForm;
