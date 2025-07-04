
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface AssignTenantModalProps {
  propertyId: string;
  unitId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const AssignTenantModal = ({ propertyId, unitId, isOpen, onClose }: AssignTenantModalProps) => {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch applications for this property
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['property-applications', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!propertyId,
  });

  // Assign tenant mutation
  const assignTenantMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      if (!unitId) throw new Error('Unit ID is required');

      const application = applications.find(app => app.id === applicationId);
      if (!application) throw new Error('Application not found');

      // First, check if user exists, if not create profile
      let { data: existingUser, error: userCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', application.applicant_email)
        .maybeSingle();

      let tenantId = existingUser?.id;

      if (!existingUser) {
        // Create a new user profile for the tenant using UUID generation
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: application.applicant_email,
            name: application.applicant_name,
            phone: application.applicant_phone,
            role: 'tenant'
          })
          .select()
          .single();

        if (profileError) throw profileError;
        tenantId = newProfile.id;
      }

      // Get unit details for rent amount
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('monthly_rent')
        .eq('id', unitId)
        .single();

      if (unitError) throw unitError;

      // Get property details for landlord_id
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      // Create tenancy
      const { error: tenancyError } = await supabase
        .from('tenancies')
        .insert({
          property_id: propertyId,
          unit_id: unitId,
          tenant_id: tenantId,
          landlord_id: property.landlord_id,
          lease_start_date: new Date().toISOString().split('T')[0],
          lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year lease
          monthly_rent: unit.monthly_rent || 0,
          status: 'active'
        });

      if (tenancyError) throw tenancyError;

      // Update unit status to occupied
      const { error: unitUpdateError } = await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', unitId);

      if (unitUpdateError) throw unitUpdateError;

      // Update application status to approved
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (appError) throw appError;

      return { tenantId, applicationId };
    },
    onSuccess: () => {
      toast.success('Tenant assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-applications', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-tenancies', propertyId] });
      onClose();
      setSelectedApplication(null);
    },
    onError: (error) => {
      toast.error(`Failed to assign tenant: ${error.message}`);
    },
  });

  const handleAssignTenant = () => {
    if (!selectedApplication) return;
    assignTenantMutation.mutate(selectedApplication);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Tenant to Unit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">There are no pending applications for this property.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select an applicant to assign to this unit:
              </p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {applications.map((application) => (
                  <Card 
                    key={application.id}
                    className={`cursor-pointer transition-all ${
                      selectedApplication === application.id 
                        ? 'ring-2 ring-green-500 border-green-200' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedApplication(application.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium">{application.applicant_name}</h4>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{application.applicant_email}</span>
                            </div>
                            
                            {application.applicant_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{application.applicant_phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>

                          {application.message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <p className="italic">"{application.message}"</p>
                            </div>
                          )}
                        </div>
                        
                        {selectedApplication === application.id && (
                          <div className="ml-4">
                            <Badge className="bg-green-100 text-green-800">Selected</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTenant}
                  disabled={!selectedApplication || assignTenantMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {assignTenantMutation.isPending ? 'Assigning...' : 'Assign Tenant'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTenantModal;
