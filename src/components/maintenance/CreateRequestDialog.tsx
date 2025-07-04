
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useCreateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { useLandlordProperties } from '@/hooks/useLandlordProperties';
import { useSendMessage } from '@/hooks/useCommunications';
import { toast } from 'sonner';

interface CreateRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

export const CreateRequestDialog = ({ isOpen, onOpenChange, trigger }: CreateRequestDialogProps) => {
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium',
    property_id: '',
  });

  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || 'tenant';
  const { data: properties } = useLandlordProperties();
  
  const createRequest = useCreateMaintenanceRequest();
  const sendMessage = useSendMessage();

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newMaintenanceRequest = await createRequest.mutateAsync({
        title: newRequest.title,
        description: newRequest.description,
        priority: newRequest.priority,
        property_id: newRequest.property_id || null,
        landlord_id: userRole === 'tenant' ? 
          properties?.find(p => p.id === newRequest.property_id)?.landlord_id : null,
      });

      // Send notification message to landlord when tenant creates request
      if (userRole === 'tenant' && newMaintenanceRequest) {
        const landlordId = properties?.find(p => p.id === newRequest.property_id)?.landlord_id;
        if (landlordId) {
          await sendMessage.mutateAsync({
            recipient_id: landlordId,
            message: `New maintenance request: ${newRequest.title}. Priority: ${newRequest.priority}. Description: ${newRequest.description}`,
            type: 'maintenance_request',
            maintenance_request_id: newMaintenanceRequest.id,
          });
        }
      }

      toast.success('Maintenance request created successfully');
      onOpenChange(false);
      setNewRequest({ title: '', description: '', priority: 'medium', property_id: '' });
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      toast.error('Failed to create maintenance request');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={newRequest.title}
              onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              placeholder="Brief description of the issue"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              placeholder="Detailed description of the maintenance issue"
              rows={3}
            />
          </div>

          {userRole === 'tenant' && (
            <div>
              <Label htmlFor="property">Property *</Label>
              <Select
                value={newRequest.property_id}
                onValueChange={(value) => setNewRequest({ ...newRequest, property_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={newRequest.priority}
              onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={handleCreateRequest}
              disabled={createRequest.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {createRequest.isPending ? 'Creating...' : 'Create Request'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
