
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Calendar, Home, Edit, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CurrentTenantsTabProps {
  propertyId: string;
}

const CurrentTenantsTab = ({ propertyId }: CurrentTenantsTabProps) => {
  // Fetch current tenancies with tenant profiles
  const { data: tenanciesData = [], isLoading } = useQuery({
    queryKey: ['property-tenancies', propertyId],
    queryFn: async () => {
      // First get tenancies
      const { data: tenancies, error: tenanciesError } = await supabase
        .from('tenancies')
        .select(`
          *,
          units(unit_number, unit_types(name))
        `)
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (tenanciesError) throw tenanciesError;
      
      if (!tenancies || tenancies.length === 0) {
        return [];
      }

      // Get tenant profiles separately
      const tenantIds = tenancies.map(t => t.tenant_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', tenantIds);
      
      if (profilesError) throw profilesError;

      // Combine tenancies with profiles
      const tenanciesWithProfiles = tenancies.map(tenancy => {
        const profile = profiles?.find(p => p.id === tenancy.tenant_id);
        return {
          ...tenancy,
          tenant_profile: profile || null
        };
      });

      return tenanciesWithProfiles;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading current tenants...</div>;
  }

  if (tenanciesData.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No current tenants found.</p>
        <p className="text-sm text-gray-400 mt-2">
          Assigned tenants will appear here after you approve applications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tenanciesData.map((tenancy) => (
        <Card key={tenancy.id} className="border-l-4 border-l-green-400">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{tenancy.tenant_profile?.name || 'Unknown Tenant'}</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active Tenant
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {tenancy.tenant_profile?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{tenancy.tenant_profile.email}</span>
                    </div>
                  )}
                  
                  {tenancy.tenant_profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{tenancy.tenant_profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3" />
                    <span>Unit {tenancy.units?.unit_number} ({tenancy.units?.unit_types?.name})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Lease started {formatDistanceToNow(new Date(tenancy.lease_start_date), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded text-sm">
                  <p><strong>Monthly Rent:</strong> KES {tenancy.monthly_rent?.toLocaleString()}</p>
                  <p><strong>Lease Period:</strong> {new Date(tenancy.lease_start_date).toLocaleDateString()} - {new Date(tenancy.lease_end_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Lease
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  End Lease
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CurrentTenantsTab;
