
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ManagePropertySettingsProps {
  property: any;
}

const ManagePropertySettings = ({ property }: ManagePropertySettingsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async () => {
      // Delete related records first
      await Promise.all([
        supabase.from('units').delete().eq('property_id', property.id),
        supabase.from('applications').delete().eq('property_id', property.id),
        supabase.from('property_amenities').delete().eq('property_id', property.id),
        supabase.from('property_images').delete().eq('property_id', property.id),
      ]);

      // Then delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Property deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      navigate('/landlord-properties');
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });

  const handleEditProperty = () => {
    // Navigate to edit property page (using the add property form in edit mode)
    navigate(`/add-property?edit=${property.id}`);
  };

  const handleDeleteProperty = () => {
    deletePropertyMutation.mutate();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Property Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Edit Property */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Edit Property Details</h3>
              <p className="text-sm text-gray-600">
                Update property information, amenities, images, and other details
              </p>
            </div>
            <Button onClick={handleEditProperty} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Property
            </Button>
          </div>

          {/* Property Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Property Status</h3>
              <p className="text-sm text-gray-600">
                Current status: <span className="font-medium capitalize">{property.status}</span>
              </p>
            </div>
            <Button variant="outline" disabled>
              Status settings coming soon
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">
                  Delete this property permanently. This action cannot be undone.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  This will also delete all associated units, applications, and data.
                </p>
              </div>
              <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Property
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Property
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Warning:</strong> This action cannot be undone. Deleting this property will:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-sm text-red-700 space-y-1">
                        <li>Permanently delete the property "{property.title}"</li>
                        <li>Delete all associated units and tenant assignments</li>
                        <li>Delete all applications and communications</li>
                        <li>Remove all property images and data</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Property:</strong> {property.title}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Address:</strong> {property.address}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteProperty}
                        disabled={deletePropertyMutation.isPending}
                      >
                        {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete Property'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Property ID:</span>
              <span className="ml-2 text-gray-600">{property.id}</span>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(property.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="ml-2 text-gray-600">
                {new Date(property.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium">Property Type:</span>
              <span className="ml-2 text-gray-600">
                {property.is_single_unit ? 'Single Unit' : 'Multi Unit'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePropertySettings;
