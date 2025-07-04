
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TenancyWithTenant } from '../types/tenancy';

export const useTenancies = (propertyId: string) => {
  const queryClient = useQueryClient();

  const { data: tenancies = [], isLoading } = useQuery({
    queryKey: ['tenancies', propertyId],
    queryFn: async (): Promise<TenancyWithTenant[]> => {
      // First, get tenancies
      const { data: tenanciesData, error: tenanciesError } = await supabase
        .from('tenancies')
        .select(`
          *,
          unit:units(
            id,
            unit_number,
            unit_type:unit_types(name)
          )
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (tenanciesError) throw tenanciesError;
      if (!tenanciesData || tenanciesData.length === 0) return [];

      // Get unique tenant IDs
      const tenantIds = [...new Set(tenanciesData.map(t => t.tenant_id))].filter(Boolean);
      
      if (tenantIds.length === 0) return tenanciesData.map(tenancy => ({
        ...tenancy,
        tenant: null
      }));

      // Fetch tenant profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', tenantIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by ID
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine tenancies with tenant profiles
      return tenanciesData.map(tenancy => ({
        ...tenancy,
        tenant: profilesMap.get(tenancy.tenant_id) || null
      }));
    },
    enabled: !!propertyId,
  });

  const endTenancyMutation = useMutation({
    mutationFn: async (tenancyId: string) => {
      const { error } = await supabase
        .from('tenancies')
        .update({ 
          status: 'ended',
          lease_end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', tenancyId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tenancy ended successfully');
      queryClient.invalidateQueries({ queryKey: ['tenancies', propertyId] });
    },
    onError: (error) => {
      console.error('Error ending tenancy:', error);
      toast.error('Failed to end tenancy');
    }
  });

  return {
    tenancies,
    isLoading,
    endTenancy: endTenancyMutation.mutate,
    isEndingTenancy: endTenancyMutation.isPending
  };
};
