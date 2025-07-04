
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserDistribution } from '../types';

export const useUserDistribution = () => {
  return useQuery({
    queryKey: ['admin-user-distribution'],
    queryFn: async (): Promise<UserDistribution[]> => {
      console.log('Fetching user distribution data...');

      const { data: rolesData } = await supabase
        .from('profiles')
        .select('role');

      const distribution = rolesData?.reduce((acc: Record<string, number>, user) => {
        const role = user.role || 'tenant';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const colors = {
        tenant: '#3b82f6',
        landlord: '#22c55e',
        caretaker: '#f59e0b',
        vendor: '#8b5cf6',
        admin: '#ef4444'
      };

      return Object.entries(distribution || {}).map(([role, count]): UserDistribution => ({
        role: role.charAt(0).toUpperCase() + role.slice(1) + 's',
        count: Number(count),
        color: colors[role as keyof typeof colors] || '#6b7280'
      }));
    }
  });
};
