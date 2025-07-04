
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export interface MaintenanceRequestWithDetails extends Tables<'maintenance_requests'> {
  properties?: {
    title: string;
    address: string;
  };
  profiles?: {
    name: string;
    email: string;
  };
  landlord?: {
    name: string;
    email: string;
  };
}

export const useMaintenanceRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['maintenance_requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties(title, address),
          profiles!maintenance_requests_tenant_id_fkey(name, email),
          landlord:profiles!maintenance_requests_landlord_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance requests:', error);
        throw new Error('Failed to fetch maintenance requests');
      }

      return data as MaintenanceRequestWithDetails[];
    },
    enabled: !!user,
  });
};

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: Omit<TablesInsert<'maintenance_requests'>, 'tenant_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          ...request,
          tenant_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance request:', error);
        throw new Error('Failed to create maintenance request');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tables<'maintenance_requests'>> }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating maintenance request:', error);
        throw new Error('Failed to update maintenance request');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
    },
  });
};
