
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import UnitSelectionModal from './UnitSelectionModal';

interface ApplicationsTableProps {
  landlordId: string;
}

const ApplicationsTable = ({ landlordId }: ApplicationsTableProps) => {
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch applications for landlord's properties
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['tenant-applications', landlordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          properties (
            id,
            title,
            address
          )
        `)
        .eq('properties.landlord_id', landlordId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tenant-applications', landlordId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [landlordId, queryClient]);

  // Accept application mutation
  const acceptApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, unitId }: { applicationId: string; unitId: string }) => {
      const application = applications.find(app => app.id === applicationId);
      if (!application) throw new Error('Application not found');

      // Create tenancy
      const { error: tenancyError } = await supabase
        .from('tenancies')
        .insert([{
          property_id: application.property_id,
          unit_id: unitId,
          tenant_id: application.applicant_email, // Using email as identifier for now
          landlord_id: landlordId,
          lease_start_date: new Date().toISOString().split('T')[0],
          lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
          monthly_rent: 0, // Will be updated based on unit
          status: 'active'
        }]);

      if (tenancyError) throw tenancyError;

      // Update unit status
      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', unitId);

      if (unitError) throw unitError;

      // Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (appError) throw appError;
    },
    onSuccess: () => {
      toast.success('Application accepted and tenant assigned!');
      queryClient.invalidateQueries({ queryKey: ['tenant-applications', landlordId] });
      setIsModalOpen(false);
      setSelectedApplication(null);
    },
    onError: (error) => {
      toast.error(`Failed to accept application: ${error.message}`);
    }
  });

  // Reject application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Application rejected');
      queryClient.invalidateQueries({ queryKey: ['tenant-applications', landlordId] });
    },
    onError: (error) => {
      toast.error(`Failed to reject application: ${error.message}`);
    }
  });

  const handleAccept = (application: any) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleUnitSelection = (unitId: string) => {
    if (selectedApplication) {
      acceptApplicationMutation.mutate({
        applicationId: selectedApplication.id,
        unitId
      });
    }
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
    <>
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Applications will appear here when tenants apply to your properties.
            </p>
          </div>
        ) : (
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{application.applicant_name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {application.applicant_email}
                        </div>
                        {application.applicant_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            {application.applicant_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.properties?.title}</div>
                        <div className="text-sm text-gray-500">{application.properties?.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(application)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={acceptApplicationMutation.isPending}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectApplicationMutation.mutate(application.id)}
                            disabled={rejectApplicationMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{application.applicant_name}</h3>
                  <p className="text-sm text-gray-500">{application.applicant_email}</p>
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
              
              <div className="mb-3">
                <p className="font-medium text-sm">{application.properties?.title}</p>
                <p className="text-xs text-gray-500">{application.properties?.address}</p>
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
              </div>
              
              {application.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(application)}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectApplicationMutation.mutate(application.id)}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }}
        propertyId={selectedApplication?.property_id}
        onUnitSelect={handleUnitSelection}
        isLoading={acceptApplicationMutation.isPending}
      />
    </>
  );
};

export default ApplicationsTable;
