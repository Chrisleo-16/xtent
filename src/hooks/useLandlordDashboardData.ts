import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const useLandlordDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['landlordDashboardData', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      // 1. Fetch properties stats
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, status')
        .eq('landlord_id', user.id);
      
      if (propertiesError) throw new Error(propertiesError.message);

      const totalProperties = properties?.length || 0;
      const occupiedUnits = properties?.filter(p => p.status === 'occupied').length || 0;

      // 2. Fetch this month's income
      const { data: incomeData, error: incomeError } = await supabase
        .from('payments')
        .select('amount')
        .eq('landlord_id', user.id)
        .eq('status', 'paid')
        .gte('paid_date', monthStart)
        .lte('paid_date', monthEnd);
      
      if (incomeError) throw new Error(incomeError.message);
      
      const monthlyIncome = incomeData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // 3. Fetch maintenance requests stats
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('status')
        .eq('landlord_id', user.id)
        .in('status', ['pending', 'in_progress']);
        
      if (maintenanceError) throw new Error(maintenanceError.message);

      const pendingRequests = maintenanceRequests?.filter(r => r.status === 'pending').length || 0;
      const inProgressRequests = maintenanceRequests?.filter(r => r.status === 'in_progress').length || 0;
      const totalOpenRequests = pendingRequests + inProgressRequests;

      // 4. Fetch rent collection stats for the current month
      const { data: rentStatusData, error: rentStatusError } = await supabase
        .from('payments')
        .select('status, amount')
        .eq('landlord_id', user.id)
        .eq('payment_type', 'rent')
        .gte('due_date', monthStart)
        .lte('due_date', monthEnd);

      if (rentStatusError) throw new Error(rentStatusError.message);

      const totalRentDue = rentStatusData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      const aggregateByStatus = (status: string) => 
        rentStatusData
            ?.filter(p => p.status === status)
            .reduce((sum, p) => sum + p.amount, 0) || 0;

      const rentCollected = aggregateByStatus('paid');
      const rentPending = aggregateByStatus('pending');
      const rentOverdue = aggregateByStatus('overdue');

      const rentCollectionStats = {
          collected: totalRentDue > 0 ? Math.round((rentCollected / totalRentDue) * 100) : 0,
          pending: totalRentDue > 0 ? Math.round((rentPending / totalRentDue) * 100) : 0,
          overdue: totalRentDue > 0 ? Math.round((rentOverdue / totalRentDue) * 100) : 0,
      };

      // 5. Fetch occupancy trend for the last 6 months
      const { data: allPropertiesForLandlord, error: allPropertiesError } = await supabase
        .from('properties')
        .select('id, created_at')
        .eq('landlord_id', user.id);

      if (allPropertiesError) throw new Error(allPropertiesError.message);

      const { data: allLeasesForLandlord, error: allLeasesError } = await supabase
        .from('leases')
        .select('property_id, start_date, end_date')
        .eq('landlord_id', user.id);

      if (allLeasesError) throw new Error(allLeasesError.message);

      const occupancyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const targetDate = subMonths(now, i);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);
        const monthName = targetDate.toLocaleString('default', { month: 'short' });

        const propertiesInMonth = allPropertiesForLandlord?.filter(
          p => new Date(p.created_at) <= monthEnd
        ) || [];
        const totalPropertiesInMonth = propertiesInMonth.length;
        
        if (totalPropertiesInMonth === 0) {
          occupancyTrend.push({ month: monthName, occupied: 0 });
          continue;
        }

        const occupiedPropertyIds = new Set();
        allLeasesForLandlord?.forEach(lease => {
          if (!lease.property_id || !lease.start_date || !lease.end_date) return;
          const leaseStart = new Date(lease.start_date);
          const leaseEnd = new Date(lease.end_date);
          
          if (leaseStart <= monthEnd && leaseEnd >= monthStart) {
            occupiedPropertyIds.add(lease.property_id);
          }
        });

        const occupiedCount = occupiedPropertyIds.size;
        const occupancyPercentage = Math.round((occupiedCount / totalPropertiesInMonth) * 100);

        occupancyTrend.push({
            month: monthName,
            occupied: occupancyPercentage,
        });
      }

      return {
        totalProperties,
        occupiedUnits,
        monthlyIncome,
        totalOpenRequests,
        pendingRequests,
        inProgressRequests,
        rentCollectionStats,
        occupancyTrend,
      };
    },
    enabled: !!user,
  });
};
