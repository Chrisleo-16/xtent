
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Calendar, MessageSquare, Home, CheckCircle, X, User, UserPlus, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Application {
  id: string;
  created_at: string;
  status: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  message: string;
  properties: {
    id: string;
    title: string;
    address: string;
  };
}

interface Unit {
  id: string;
  unit_number: string;
  monthly_rent: number;
  unit_types: { name: string };
}

const LandlordApplicationsManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Set up real-time subscription for applications
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for landlord applications...');
    
    const channel = supabase
      .channel('landlord-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          console.log('Application change detected:', payload);
          // Force immediate refetch of applications
          queryClient.invalidateQueries({ queryKey: ['landlord-applications', user.id] });
          queryClient.refetchQueries({ queryKey: ['landlord-applications', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up applications real-time subscription...');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Fetch applications for landlord's properties with enhanced query
  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['landlord-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching applications for landlord:', user.id);
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          properties!inner(id, title, address, landlord_id)
        `)
        .eq('properties.landlord_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching landlord applications:', error);
        throw error;
      }
      
      console.log('Fetched applications:', data?.length || 0, data);
      return data as Application[];
    },
    enabled: !!user?.id,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });

  // Manual refresh function
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
    toast.success('Applications refreshed');
  };

  // Fetch vacant units for selected property
  const { data: vacantUnits = [] } = useQuery({
    queryKey: ['vacant-units', selectedApplication?.properties.id],
    queryFn: async () => {
      if (!selectedApplication?.properties.id) return [];
      
      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          unit_number,
          monthly_rent,
          unit_types(name)
        `)
        .eq('property_id', selectedApplication.properties.id)
        .eq('status', 'vacant')
        .order('unit_number');
      
      if (error) throw error;
      return data as Unit[];
    },
    enabled: !!selectedApplication?.properties.id,
  });

  // Assignment mutation
  const assignUnitMutation = useMutation({
    mutationFn: async ({ applicationId, unitId }: { applicationId: string; unitId: string }) => {
      console.log('Assigning unit:', { applicationId, unitId });
      
      // Get unit details for tenancy creation
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('property_id, monthly_rent')
        .eq('id', unitId)
        .single();
      
      if (unitError) throw unitError;

      // Get application details for tenant info
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('applicant_email, applicant_name, applicant_phone')
        .eq('id', applicationId)
        .single();
      
      if (appError) throw appError;

      // Get or create tenant profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', application.applicant_email)
        .maybeSingle();
      
      let tenantId = profile?.id;

      if (!profile) {
        // Create a new user profile for the tenant
        const { data: newProfile, error: createProfileError } = await supabase
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

        if (createProfileError) throw createProfileError;
        tenantId = newProfile.id;
      }

      // Create tenancy
      const { error: tenancyError } = await supabase
        .from('tenancies')
        .insert({
          property_id: unit.property_id,
          unit_id: unitId,
          tenant_id: tenantId,
          landlord_id: user!.id,
          lease_start_date: new Date().toISOString().split('T')[0],
          lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year lease
          monthly_rent: unit.monthly_rent,
          status: 'active'
        });
      
      if (tenancyError) throw tenancyError;

      // Update unit status
      const { error: unitUpdateError } = await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', unitId);
      
      if (unitUpdateError) throw unitUpdateError;

      // Update application status
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);
      
      if (appUpdateError) throw appUpdateError;

      return { applicationId, unitId };
    },
    onSuccess: () => {
      toast.success('Unit assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['landlord-applications'] });
      queryClient.invalidateQueries({ queryKey: ['vacant-units'] });
      queryClient.refetchQueries({ queryKey: ['landlord-applications', user?.id] });
      setShowAssignModal(false);
      setSelectedApplication(null);
      setSelectedUnit('');
    },
    onError: (error) => {
      console.error('Assignment error:', error);
      toast.error(`Failed to assign unit: ${error.message}`);
    },
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
      queryClient.invalidateQueries({ queryKey: ['landlord-applications', user?.id] });
      queryClient.refetchQueries({ queryKey: ['landlord-applications', user?.id] });
    },
    onError: (error) => {
      toast.error(`Failed to reject application: ${error.message}`);
    },
  });

  const handleAssignUnit = () => {
    if (!selectedApplication || !selectedUnit) {
      toast.error('Please select a unit to assign');
      return;
    }
    
    assignUnitMutation.mutate({
      applicationId: selectedApplication.id,
      unitId: selectedUnit
    });
  };

  const handleReject = (applicationId: string) => {
    if (confirm('Are you sure you want to reject this application?')) {
      rejectApplicationMutation.mutate(applicationId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const processedApplications = applications.filter(app => app.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Applications</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pending Applications ({pendingApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.applicant_name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {application.applicant_email}
                          </p>
                          {application.applicant_phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {application.applicant_phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.properties.title}</p>
                          <p className="text-sm text-gray-600">{application.properties.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {application.message ? (
                            <p className="text-sm text-gray-600 truncate" title={application.message}>
                              {application.message}
                            </p>
                          ) : (
                            <span className="text-gray-400 text-sm">No message</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowAssignModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(application.id)}
                            disabled={rejectApplicationMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Applications */}
      {processedApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Applications ({processedApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.applicant_name}</p>
                          <p className="text-sm text-gray-600">{application.applicant_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.properties.title}</p>
                          <p className="text-sm text-gray-600">{application.properties.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(application.status)}>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Applications Message */}
      {applications.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600">
              Applications from potential tenants will appear here when they apply to your properties.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unit Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Unit to {selectedApplication?.applicant_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Property: {selectedApplication?.properties.title}
              </p>
              <p className="text-sm text-gray-600">
                Select an available unit to assign to this applicant:
              </p>
            </div>
            
            {vacantUnits.length > 0 ? (
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {vacantUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unit_number} - {unit.unit_types?.name} (KES {unit.monthly_rent?.toLocaleString()}/month)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-red-600">No vacant units available for this property.</p>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignUnit}
                disabled={!selectedUnit || assignUnitMutation.isPending || vacantUnits.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {assignUnitMutation.isPending ? 'Assigning...' : 'Assign Unit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordApplicationsManagement;
