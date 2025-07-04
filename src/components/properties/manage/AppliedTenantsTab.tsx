
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import AssignToUnitModal from './AssignToUnitModal';

interface AppliedTenantsTabProps {
  propertyId: string;
}

const AppliedTenantsTab = ({ propertyId }: AppliedTenantsTabProps) => {
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending applications
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
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Application status updated');
      queryClient.invalidateQueries({ queryKey: ['property-applications', propertyId] });
    },
    onError: (error) => {
      toast.error(`Failed to update application: ${error.message}`);
    },
  });

  const handleAssignToUnit = (application: any) => {
    setSelectedApplication(application);
    setIsAssignModalOpen(true);
  };

  const handleRejectApplication = (applicationId: string) => {
    updateApplicationMutation.mutate({ applicationId, status: 'rejected' });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No pending applications found.</p>
        <p className="text-sm text-gray-400 mt-2">
          Applications will appear here when potential tenants apply for your property.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="border-l-4 border-l-yellow-400">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{application.applicant_name}</h4>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
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
              
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  onClick={() => handleAssignToUnit(application)}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign to Unit
                </Button>
                <Button
                  onClick={() => handleRejectApplication(application.id)}
                  variant="destructive"
                  size="sm"
                >
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AssignToUnitModal
        application={selectedApplication}
        propertyId={propertyId}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
};

export default AppliedTenantsTab;
