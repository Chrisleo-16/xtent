
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';

interface MaintenanceEmptyStateProps {
  userRole: string;
  onCreateRequest: () => void;
}

export const MaintenanceEmptyState = ({ userRole, onCreateRequest }: MaintenanceEmptyStateProps) => {
  return (
    <div className="text-center py-12 md:py-20">
      <Wrench className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance requests</h3>
      <p className="text-gray-600 mb-6 px-4">
        {userRole === 'landlord' 
          ? 'No maintenance requests have been submitted yet.' 
          : 'You haven\'t submitted any maintenance requests yet.'}
      </p>
      <Button onClick={onCreateRequest} className="bg-green-600 hover:bg-green-700">
        <Plus className="h-4 w-4 mr-2" />
        Create First Request
      </Button>
    </div>
  );
};
