
import React, { useState } from 'react';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { MaintenanceHeader } from '@/components/maintenance/MaintenanceHeader';
import { MaintenanceEmptyState } from '@/components/maintenance/MaintenanceEmptyState';
import { MaintenanceLoadingState } from '@/components/maintenance/MaintenanceLoadingState';
import { MaintenanceRequestCard } from '@/components/maintenance/MaintenanceRequestCard';
import { CreateRequestDialog } from '@/components/maintenance/CreateRequestDialog';
import { useMaintenanceRequests, useUpdateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { useSendMessage } from '@/hooks/useCommunications';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Maintenance = () => {
  const { role: userRole } = useUserRole();
  const { data: requests = [], isLoading, error } = useMaintenanceRequests();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const updateRequest = useUpdateMaintenanceRequest();
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

  const handleCreateRequest = () => {
    setIsCreateDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string, request: any) => {
    try {
      // Cast status to the correct type for maintenance requests
      const validStatus = status as "pending" | "in_progress" | "completed" | "cancelled";
      await updateRequest.mutateAsync({ id, updates: { status: validStatus } });
      
      // Send notification when status changes
      if (request.tenant_id && userRole === 'landlord') {
        await sendMessage.mutateAsync({
          recipient_id: request.tenant_id,
          message: `Your maintenance request "${request.title}" has been updated to: ${status}`,
          type: 'message', // Use valid communication type
          maintenance_request_id: id,
        });
      }
      
      toast.success('Request status updated successfully');
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const handleStartChat = (request: any) => {
    const chatPartnerId = userRole === 'landlord' ? request.tenant_id : request.landlord_id;
    if (chatPartnerId) {
      navigate(`/chat?with=${chatPartnerId}&context=maintenance&requestId=${request.id}`);
    }
  };

  if (error) {
    return (
      <ResponsiveSidebarLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-red-500">Error loading maintenance requests</p>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
          </div>
        </div>
      </ResponsiveSidebarLayout>
    );
  }

  return (
    <ResponsiveSidebarLayout>
      <div className="space-y-6">
        <MaintenanceHeader userRole={userRole} />
        
        {isLoading && <MaintenanceLoadingState />}
        
        {!isLoading && requests.length === 0 && (
          <MaintenanceEmptyState 
            userRole={userRole}
            onCreateRequest={handleCreateRequest}
          />
        )}
        
        {!isLoading && requests.length > 0 && (
          <div className="grid gap-6">
            {requests.map((request) => (
              <MaintenanceRequestCard 
                key={request.id} 
                request={request}
                userRole={userRole}
                onUpdateStatus={handleUpdateStatus}
                onStartChat={handleStartChat}
              />
            ))}
          </div>
        )}

        <CreateRequestDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          trigger={<></>}
        />
      </div>
    </ResponsiveSidebarLayout>
  );
};

export default Maintenance;
