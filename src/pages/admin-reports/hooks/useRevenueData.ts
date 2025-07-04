
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RevenueData, SystemMetrics } from '../types';

export const useRevenueData = (reportPeriod: string, systemMetrics?: SystemMetrics) => {
  return useQuery({
    queryKey: ['admin-revenue-trend', reportPeriod],
    queryFn: async (): Promise<RevenueData[]> => {
      console.log('Fetching revenue trend data...');

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, paid_date')
        .eq('status', 'paid')
        .gte('paid_date', new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('paid_date');

      const { data: propertiesCount } = await supabase
        .from('properties')
        .select('id, created_at');

      // Group by month
      const monthlyData = paymentsData?.reduce((acc: any, payment) => {
        if (payment.paid_date) {
          const month = new Date(payment.paid_date).toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { month, revenue: 0, properties: 0 };
          }
          acc[month].revenue += payment.amount || 0;
        }
        return acc;
      }, {});

      // Add property counts (simplified)
      const monthlyArray = Object.values(monthlyData || {}).map((item: any, index) => ({
        ...item,
        properties: Math.min((propertiesCount?.length || 0), 65 + index * 3)
      }));

      return monthlyArray;
    },
    enabled: !!systemMetrics
  });
};
