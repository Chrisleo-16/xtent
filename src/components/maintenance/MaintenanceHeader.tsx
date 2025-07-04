
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { CreateRequestDialog } from './CreateRequestDialog';

interface MaintenanceHeaderProps {
  userRole: string;
}

export const MaintenanceHeader = ({ userRole }: MaintenanceHeaderProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm border-b p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="h-6 w-6 md:h-7 md:w-7 text-green-600 flex-shrink-0" />
            <span className="truncate">Maintenance Requests</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {userRole === 'landlord' ? 'Manage property maintenance requests' : 'Submit and track your maintenance requests'}
          </p>
        </div>
        
        <CreateRequestDialog 
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          trigger={
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">New Request</span>
              <span className="xs:hidden">New</span>
            </Button>
          }
        />
      </div>
    </div>
  );
};
