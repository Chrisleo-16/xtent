
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Mail, Users, UserPlus, Calendar, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import AssignTenantModal from '../management/AssignTenantModal';

interface ManagePropertyApplicationsProps {
  propertyId: string;
}

const ManagePropertyApplications = ({ propertyId }: ManagePropertyApplicationsProps) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['property-applications', propertyId],
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

  // Fetch current tenancies with manual join
  const { data: tenancies = [], isLoading: tenanciesLoading } = useQuery({
    queryKey: ['property-tenancies', propertyId],
    queryFn: async () => {
      // First get tenancies
      const { data: tenanciesData, error: tenanciesError } = await supabase
        .from('tenancies')
        .select(`
          *,
          units(unit_number, unit_types(name))
        `)
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (tenanciesError) throw tenanciesError;
      if (!tenanciesData || tenanciesData.length === 0) return [];

      // Get unique tenant IDs
      const tenantIds = [...new Set(tenanciesData.map(t => t.tenant_id))].filter(Boolean);
      
      if (tenantIds.length === 0) {
        return tenanciesData.map(tenancy => ({
          ...tenancy,
          tenant: null
        }));
      }

      // Fetch tenant profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', tenantIds);

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine data
      return tenanciesData.map(tenancy => ({
        ...tenancy,
        tenant: profilesMap.get(tenancy.tenant_id) || null
      }));
    },
  });

  // Fetch vacant units
  const { data: vacantUnits = [] } = useQuery({
    queryKey: ['vacant-units', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          unit_types(name)
        `)
        .eq('property_id', propertyId)
        .eq('status', 'vacant')
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
  });

  // End lease mutation
  const endLeaseMutation = useMutation({
    mutationFn: async (tenancyId: string) => {
      const tenancy = tenancies.find(t => t.id === tenancyId);
      if (!tenancy) throw new Error('Tenancy not found');

      const { error: tenancyError } = await supabase
        .from('tenancies')
        .update({ status: 'ended' })
        .eq('id', tenancyId);

      if (tenancyError) throw tenancyError;

      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'vacant' })
        .eq('id', tenancy.unit_id);

      if (unitError) throw unitError;
    },
    onSuccess: () => {
      toast.success('Lease ended successfully');
      queryClient.invalidateQueries({ queryKey: ['property-tenancies', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['vacant-units', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
    },
    onError: (error) => {
      toast.error(`Failed to end lease: ${error.message}`);
    },
  });

  const handleAssignToUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setIsAssignModalOpen(true);
  };

  const handleEndLease = (tenancyId: string) => {
    if (window.confirm('Are you sure you want to end this lease? This action cannot be undone.')) {
      endLeaseMutation.mutate(tenancyId);
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
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Current Tenants ({tenancies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {/* Applied Tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-green-600" />
                Applied Tenants ({pendingApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingApplications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No pending applications</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-4">
                    {pendingApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{application.applicant_name}</h4>
                            <Badge className={getStatusBadge(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
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
                            <p className="text-sm text-gray-700 mt-2 italic">"{application.message}"</p>
                          )}
                        </div>
                        
                        {vacantUnits.length > 0 && (
                          <div className="ml-4 space-y-2">
                            {vacantUnits.slice(0, 2).map((unit) => (
                              <Button
                                key={unit.id}
                                size="sm"
                                onClick={() => handleAssignToUnit(unit.id)}
                                className="bg-green-600 hover:bg-green-700 text-xs"
                              >
                                Assign to {unit.unit_number}
                              </Button>
                            ))}
                            {vacantUnits.length > 2 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssignToUnit(vacantUnits[0].id)}
                                className="text-xs"
                              >
                                +{vacantUnits.length - 2} more units
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Processed Applications */}
          {processedApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Applications ({processedApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-2 pr-4">
                    {processedApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{application.applicant_name}</p>
                          <p className="text-xs text-gray-600">{application.applicant_email}</p>
                        </div>
                        <Badge className={getStatusBadge(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Current Tenants ({tenancies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tenanciesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : tenancies.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No current tenants</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tenancies.map((tenancy) => (
                    <div key={tenancy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{tenancy.tenant?.name || 'Unknown Tenant'}</h4>
                          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{tenancy.tenant?.email || 'No email'}</span>
                          </div>
                          {tenancy.tenant?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{tenancy.tenant.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Unit:</span>
                            <span>{tenancy.units?.unit_number} ({tenancy.units?.unit_types?.name})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Lease:</span>
                            <span>{new Date(tenancy.lease_start_date).toLocaleDateString()} - {new Date(tenancy.lease_end_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Rent:</span>
                            <span>KES {tenancy.monthly_rent?.toLocaleString()}/month</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEndLease(tenancy.id)}
                          disabled={endLeaseMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          End Lease
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignTenantModal
        propertyId={propertyId}
        unitId={selectedUnitId}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUnitId(null);
        }}
      />
    </div>
  );
};

export default ManagePropertyApplications;
