
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Home, Eye, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Application {
  id: string;
  created_at: string;
  status: string;
  message: string | null;
  properties: {
    id: string;
    title: string;
    address: string;
    monthly_rent: number;
  } | null;
}

interface Tenancy {
  id: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  status: string;
  properties: {
    id: string;
    title: string;
    address: string;
  };
  units: {
    unit_number: string;
    unit_types: { name: string };
  };
}

const EnhancedTenantApplicationsTracker = () => {
  const { user } = useAuth();
  const [celebrationShown, setCelebrationShown] = useState(false);

  // Fetch tenant applications
  const { data: applications = [] } = useQuery({
    queryKey: ['tenant-applications', user?.id],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          created_at,
          status,
          message,
          properties (
            id,
            title,
            address,
            monthly_rent
          )
        `)
        .eq('applicant_email', user.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    },
    enabled: !!user?.email,
  });

  // Fetch tenant tenancies (active leases)
  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenant-tenancies', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          id,
          lease_start_date,
          lease_end_date,
          monthly_rent,
          status,
          properties (
            id,
            title,
            address
          ),
          units (
            unit_number,
            unit_types (name)
          )
        `)
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .order('lease_start_date', { ascending: false });
      
      if (error) throw error;
      return data as Tenancy[];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for applications
  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `applicant_email=eq.${user.email}`
        },
        (payload) => {
          console.log('Application updated:', payload);
          
          if (payload.new.status === 'approved' && !celebrationShown) {
            toast.success('🎉 Congratulations! Your application has been approved!', {
              duration: 5000,
            });
            setCelebrationShown(true);
          }
          
          // Invalidate queries to refetch data
          // This would typically be done with queryClient.invalidateQueries
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, celebrationShown]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'approved':
        return <Home className="h-4 w-4" />;
      case 'rejected':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const approvedApplications = applications.filter(app => app.status === 'approved');
  const hasActiveLease = tenancies.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
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
                  {approvedApplications.length}
                </p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Leases</p>
                <p className="text-2xl font-bold text-purple-600">{tenancies.length}</p>
              </div>
              <Home className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Lease Section */}
      {hasActiveLease && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              My Current Lease
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tenancies.map((tenancy) => (
              <div key={tenancy.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{tenancy.properties.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tenancy.properties.address}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active Lease</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Unit</p>
                      <p className="font-medium">{tenancy.units.unit_number} - {tenancy.units.unit_types.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="font-medium">KES {tenancy.monthly_rent.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Lease Period</p>
                      <p className="font-medium">
                        {new Date(tenancy.lease_start_date).toLocaleDateString()} - {new Date(tenancy.lease_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <Link to={`/property/${tenancy.properties.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Property
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    Download Lease
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Applications History */}
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't applied to any properties yet. Start browsing to find your perfect home!
              </p>
              <Link to="/listings">
                <Button className="bg-green-600 hover:bg-green-700">
                  Browse Properties
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <h3 className="font-semibold">
                          {application.properties?.title || 'Property Unavailable'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.properties?.address}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </span>
                      {application.properties?.monthly_rent && (
                        <span className="font-semibold">
                          KES {application.properties.monthly_rent.toLocaleString()}/month
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {application.properties && (
                        <Link to={`/property/${application.properties.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Property
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {application.message && (
                    <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                      <p className="font-medium mb-1">Your Message:</p>
                      <p className="text-gray-700">{application.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTenantApplicationsTracker;
