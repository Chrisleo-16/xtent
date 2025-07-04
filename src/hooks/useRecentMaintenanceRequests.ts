
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

export type MaintenanceRequestWithDetails = Pick<Tables<'maintenance_requests'>, 'id' | 'description' | 'status' | 'priority'> & {
  properties: { title: string } | null;
  profiles: { name: string | null } | null;
};

const fetchRecentMaintenanceRequests = async (landlordId: string): Promise<MaintenanceRequestWithDetails[]> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('id, description, status, priority, properties(title), profiles!tenant_id(name)')
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching maintenance requests:', error);
    throw new Error(error.message);
  }

  return data as MaintenanceRequestWithDetails[];
};

export const useRecentMaintenanceRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recentMaintenanceRequests', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return fetchRecentMaintenanceRequests(user.id);
    },
    enabled: !!user,
  });
};
