
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

export interface TenantUtilityAllocationWithDetails extends Tables<'tenant_utility_allocations'> {
  utility_bills?: {
    utility_type: string;
    provider_name: string;
    billing_period_start: string;
    billing_period_end: string;
    properties?: {
      title: string;
      address: string;
    };
  };
}

export const useTenantUtilityAllocations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tenant_utility_allocations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tenant_utility_allocations')
        .select(`
          *,
          utility_bills!inner(
            utility_type,
            provider_name,
            billing_period_start,
            billing_period_end,
            properties(title, address)
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tenant utility allocations:', error);
        throw new Error('Failed to fetch utility allocations');
      }

      return data as TenantUtilityAllocationWithDetails[];
    },
    enabled: !!user,
  });
};

export const useUpdateAllocationPaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('tenant_utility_allocations')
        .update({ payment_status: status as any })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        throw new Error('Failed to update payment status');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant_utility_allocations'] });
    },
  });
};
