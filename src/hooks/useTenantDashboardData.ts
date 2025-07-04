
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

export type LeaseWithProperty = Tables<'leases'> & {
  properties: Tables<'properties'> | null;
};

export const useTenantDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tenantDashboardData', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // 1. Fetch active lease and associated property
      const { data: lease, error: leaseError } = await supabase
        .from('leases')
        .select('*, properties(*)')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (leaseError) throw new Error(leaseError.message);
      if (!lease || !lease.properties) {
        return { lease: null, payments: [], maintenanceRequests: [], landlord: null };
      }

      // 2. Fetch payments for the lease
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('lease_id', lease.id)
        .order('paid_date', { ascending: false });

      if (paymentsError) throw new Error(paymentsError.message);
      
      // 3. Fetch maintenance requests for the property
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', lease.properties.id)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (maintenanceError) throw new Error(maintenanceError.message);
      
      // 4. Fetch landlord info
      let landlord = null;
      if (lease.landlord_id) {
          const { data: landlordData, error: landlordError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', lease.landlord_id)
              .single();
          if (landlordError) {
            console.error("Error fetching landlord", landlordError);
          } else {
            landlord = landlordData;
          }
      }
      
      return {
        lease: lease as LeaseWithProperty,
        payments: payments || [],
        maintenanceRequests: maintenanceRequests || [],
        landlord,
      };
    },
    enabled: !!user,
  });
};
