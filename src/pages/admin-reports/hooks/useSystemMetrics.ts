
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SystemMetrics } from '../types';

export const useSystemMetrics = (reportPeriod: string) => {
  return useQuery({
    queryKey: ['admin-system-metrics', reportPeriod],
    queryFn: async (): Promise<SystemMetrics> => {
      console.log('Fetching admin system metrics...');

      // Total revenue from all payments
      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Total users count
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id');

      const totalUsers = usersData?.length || 0;

      // Total properties count
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id');

      const totalProperties = propertiesData?.length || 0;

      // Calculate occupancy rate
      const { data: unitsData } = await supabase
        .from('units')
        .select('status');

      const totalUnits = unitsData?.length || 0;
      const occupiedUnits = unitsData?.filter(unit => unit.status === 'occupied').length || 0;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Calculate growth (simplified - would need historical data for accurate calculation)
      const monthlyGrowth = 12.3; // Placeholder

      return {
        totalRevenue,
        totalUsers,
        totalProperties,
        occupancyRate,
        monthlyGrowth
      };
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
