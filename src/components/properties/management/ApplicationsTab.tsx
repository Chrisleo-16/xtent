import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import AssignTenantModal from './AssignTenantModal';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationsTabProps {
  propertyId: string;
}

const ApplicationsTab = ({ propertyId }: ApplicationsTabProps) => {
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch applications for this property
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for applications
  useEffect(() => {
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `property_id=eq.${propertyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['applications', propertyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, queryClient]);

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
      queryClient.invalidateQueries({ queryKey: ['applications', propertyId] });
    },
    onError: (error) => {
      toast.error(`Failed to update application: ${error.message}`);
    },
  });

  const handleAssignTenant = (unitId?: string) => {
    setSelectedUnitId(unitId || null);
    setIsAssignModalOpen(true);
  };

  const handleStatusUpdate = (applicationId: string, status: string) => {
    updateApplicationMutation.mutate({ applicationId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Property Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found for this property.</p>
              <p className="text-sm text-gray-400 mt-2">
                Applications will appear here when potential tenants apply for your property.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">{application.applicant_name}</div>
                      <div className="text-sm text-gray-500">{application.applicant_email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{application.applicant_email}</span>
                        </div>
                        {application.applicant_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{application.applicant_phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {application.message || 'No message provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAssignTenant()}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === 'approved' && (
                          <Badge variant="secondary">Assigned</Badge>
                        )}
                        {application.status === 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(application.id, 'pending')}
                          >
                            Reconsider
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Tenant Modal */}
      <AssignTenantModal
        propertyId={propertyId}
        unitId={selectedUnitId}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedApplication(null);
          setSelectedUnitId(null);
        }}
      />
    </div>
  );
};

export default ApplicationsTab;
