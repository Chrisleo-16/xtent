
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useReportData = (reportType: string, dateRange: string, selectedProperty: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['report-data', reportType, dateRange, selectedProperty, user?.id],
    queryFn: async () => {
      if (!user?.id || !reportType) return null;

      console.log('Fetching report data:', { reportType, dateRange, selectedProperty });

      // Calculate date range
      const getDateRange = () => {
        const now = new Date();
        const ranges = {
          'this-month': {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: now
          },
          'last-month': {
            start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            end: new Date(now.getFullYear(), now.getMonth(), 0)
          },
          'last-3-months': {
            start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
            end: now
          },
          'this-year': {
            start: new Date(now.getFullYear(), 0, 1),
            end: now
          }
        };
        return ranges[dateRange as keyof typeof ranges] || ranges['this-month'];
      };

      const { start, end } = getDateRange();

      // Get user's properties
      const { data: userProperties } = await supabase
        .from('properties')
        .select('id, title, monthly_rent, custom_type')
        .eq('landlord_id', user.id);

      const propertyIds = userProperties?.map(p => p.id) || [];
      const propertiesToQuery = selectedProperty !== 'all' ? [selectedProperty] : propertyIds;

      if (propertiesToQuery.length === 0) {
        return { reportType, data: [], summary: { totalRecords: 0, totalAmount: 0 } };
      }

      switch (reportType) {
        case 'income-statement':
          // Fetch income data (payments)
          const { data: payments } = await supabase
            .from('payments')
            .select(`
              id,
              amount,
              paid_date,
              payment_type,
              status,
              leases!inner(property_id, monthly_rent),
              properties!inner(title)
            `)
            .eq('landlord_id', user.id)
            .eq('status', 'paid')
            .gte('paid_date', start.toISOString().split('T')[0])
            .lte('paid_date', end.toISOString().split('T')[0])
            .in('leases.property_id', propertiesToQuery);

          // Fetch expenses
          const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .eq('landlord_id', user.id)
            .gte('date', start.toISOString().split('T')[0])
            .lte('date', end.toISOString().split('T')[0])
            .in('property_id', propertiesToQuery);

          const totalIncome = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
          const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

          return {
            reportType,
            data: {
              income: payments || [],
              expenses: expenses || [],
              summary: {
                totalIncome,
                totalExpenses,
                netIncome: totalIncome - totalExpenses
              }
            }
          };

        case 'outstanding-payments':
          const today = new Date().toISOString().split('T')[0];
          const { data: overduePayments } = await supabase
            .from('payments')
            .select(`
              id,
              amount,
              due_date,
              payment_type,
              status,
              leases!inner(property_id, tenant_id),
              properties!inner(title),
              profiles!inner(name, email)
            `)
            .eq('landlord_id', user.id)
            .eq('status', 'pending')
            .lt('due_date', today)
            .in('leases.property_id', propertiesToQuery);

          return {
            reportType,
            data: overduePayments || [],
            summary: {
              totalRecords: overduePayments?.length || 0,
              totalAmount: overduePayments?.reduce((sum, p) => sum + p.amount, 0) || 0
            }
          };

        case 'maintenance-log':
          const { data: maintenanceRequests } = await supabase
            .from('maintenance_requests')
            .select(`
              id,
              title,
              description,
              status,
              priority,
              estimated_cost,
              actual_cost,
              created_at,
              completed_date,
              properties!inner(title)
            `)
            .eq('landlord_id', user.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .in('property_id', propertiesToQuery)
            .order('created_at', { ascending: false });

          return {
            reportType,
            data: maintenanceRequests || [],
            summary: {
              totalRecords: maintenanceRequests?.length || 0,
              totalCost: maintenanceRequests?.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0) || 0
            }
          };

        case 'tenant-report':
          const { data: tenancies } = await supabase
            .from('tenancies')
            .select(`
              id,
              lease_start_date,
              lease_end_date,
              monthly_rent,
              status,
              properties!inner(title),
              profiles!inner(name, email, phone)
            `)
            .eq('landlord_id', user.id)
            .in('property_id', propertiesToQuery)
            .order('lease_start_date', { ascending: false });

          return {
            reportType,
            data: tenancies || [],
            summary: {
              totalTenants: tenancies?.length || 0,
              activeTenants: tenancies?.filter(t => t.status === 'active').length || 0
            }
          };

        case 'property-performance':
          const { data: propertyData } = await supabase
            .from('properties')
            .select(`
              id,
              title,
              monthly_rent,
              custom_type,
              created_at,
              units!inner(id, status),
              tenancies!inner(id, status, monthly_rent)
            `)
            .eq('landlord_id', user.id)
            .in('id', propertiesToQuery);

          const performanceData = propertyData?.map(property => {
            const totalUnits = property.units?.length || 1;
            const occupiedUnits = property.units?.filter(u => u.status === 'occupied').length || 0;
            const occupancyRate = (occupiedUnits / totalUnits) * 100;
            const monthlyRevenue = property.tenancies?.reduce((sum, t) => sum + (t.monthly_rent || 0), 0) || 0;

            return {
              ...property,
              totalUnits,
              occupiedUnits,
              occupancyRate,
              monthlyRevenue
            };
          });

          return {
            reportType,
            data: performanceData || [],
            summary: {
              totalProperties: performanceData?.length || 0,
              avgOccupancy: performanceData?.reduce((sum, p) => sum + p.occupancyRate, 0) / (performanceData?.length || 1) || 0
            }
          };

        default:
          return { reportType, data: [], summary: {} };
      }
    },
    enabled: !!user?.id && !!reportType,
    staleTime: 30000 // Cache for 30 seconds
  });
};
