
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMountedState } from './useMountedState';

export interface OptimizedPayment {
  id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'failed' | 'refunded';
  payment_type: string;
  transaction_reference?: string;
}

export interface OptimizedMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  created_at: string;
  images: string[];
}

export interface OptimizedLease {
  id: string;
  property_id: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  status: string;
  property: {
    id: string;
    title: string;
    address: string;
    bedrooms?: number;
    bathrooms?: number;
    size_sqft?: number;
  };
}

export interface OptimizedLandlord {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  rejection_reason?: string;
  role?: string;
  verification_status?: string;
}

export interface OptimizedTenantDashboardData {
  lease: OptimizedLease | null;
  payments: OptimizedPayment[];
  maintenanceRequests: OptimizedMaintenanceRequest[];
  landlord: OptimizedLandlord | null;
  upcomingPayments: OptimizedPayment[];
  recentPayments: OptimizedPayment[];
  communications: Array<{id: string; message: string; created_at: string}>;
  notifications: Array<{id: string; title: string; message: string; is_read: boolean}>;
}

export const useOptimizedTenantDashboard = () => {
  const { user } = useAuth();
  const mountedRef = useMountedState();

  return useQuery({
    queryKey: ['optimizedTenantDashboard', user?.id],
    queryFn: async (): Promise<OptimizedTenantDashboardData | null> => {
      if (!user?.id || !mountedRef.current) {
        console.log('No user ID or component unmounted');
        return null;
      }

      console.log('Fetching optimized tenant dashboard data for user:', user.id);

      try {
        // Get active lease with property details
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select(`
            id,
            property_id,
            monthly_rent,
            start_date,
            end_date,
            status,
            landlord_id,
            properties:property_id (
              id,
              title,
              address,
              bedrooms,
              bathrooms,
              size_sqft
            )
          `)
          .eq('tenant_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (leaseError) {
          console.error('Lease error:', leaseError);
          return null;
        }

        if (!mountedRef.current) return null;

        const lease: OptimizedLease | null = leases ? {
          id: leases.id,
          property_id: leases.property_id,
          monthly_rent: leases.monthly_rent,
          start_date: leases.start_date,
          end_date: leases.end_date,
          status: leases.status,
          property: {
            id: leases.properties?.id || '',
            title: leases.properties?.title || '',
            address: leases.properties?.address || '',
            bedrooms: leases.properties?.bedrooms,
            bathrooms: leases.properties?.bathrooms,
            size_sqft: leases.properties?.size_sqft,
          }
        } : null;

        // Get payments with retry logic
        const fetchPayments = async (retries = 3): Promise<OptimizedPayment[]> => {
          try {
            const { data: payments, error: paymentsError } = await supabase
              .from('payments')
              .select('id, amount, due_date, paid_date, status, payment_type, transaction_reference')
              .eq('tenant_id', user.id)
              .order('due_date', { ascending: false })
              .limit(10);

            if (paymentsError) throw paymentsError;
            
            return (payments || []).map(payment => ({
              id: payment.id,
              amount: payment.amount,
              due_date: payment.due_date,
              paid_date: payment.paid_date,
              status: payment.status as OptimizedPayment['status'],
              payment_type: payment.payment_type,
              transaction_reference: payment.transaction_reference,
            }));
          } catch (error) {
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchPayments(retries - 1);
            }
            console.error('Failed to fetch payments:', error);
            return [];
          }
        };

        // Get maintenance requests
        const fetchMaintenanceRequests = async (): Promise<OptimizedMaintenanceRequest[]> => {
          try {
            const { data: requests, error: requestsError } = await supabase
              .from('maintenance_requests')
              .select('id, title, description, status, priority, created_at, images')
              .eq('tenant_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5);

            if (requestsError) throw requestsError;
            return (requests || []).map(request => ({
              id: request.id,
              title: request.title,
              description: request.description,
              status: request.status as OptimizedMaintenanceRequest['status'],
              priority: request.priority,
              created_at: request.created_at,
              images: request.images || []
            }));
          } catch (error) {
            console.error('Failed to fetch maintenance requests:', error);
            return [];
          }
        };

        // Get landlord info
        const fetchLandlord = async (): Promise<OptimizedLandlord | null> => {
          if (!leases?.landlord_id) return null;
          
          try {
            const { data: landlord, error: landlordError } = await supabase
              .from('profiles')
              .select('id, name, email, phone, created_at, rejection_reason, role, verification_status')
              .eq('id', leases.landlord_id)
              .single();

            if (landlordError) throw landlordError;
            return landlord;
          } catch (error) {
            console.error('Failed to fetch landlord:', error);
            return { id: leases.landlord_id };
          }
        };

        // Get communications
        const fetchCommunications = async () => {
          try {
            const { data, error } = await supabase
              .from('communications')
              .select('id, message, created_at')
              .eq('recipient_id', user.id)
              .order('created_at', { ascending: false })
              .limit(3);

            if (error) throw error;
            return (data || []).map(comm => ({
              id: comm.id,
              message: comm.message,
              created_at: comm.created_at
            }));
          } catch (error) {
            console.error('Failed to fetch communications:', error);
            return [];
          }
        };

        // Get notifications
        const fetchNotifications = async () => {
          try {
            const { data, error } = await supabase
              .from('notifications')
              .select('id, title, message, is_read')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5);

            if (error) throw error;
            return (data || []).map(notif => ({
              id: notif.id,
              title: notif.title,
              message: notif.message,
              is_read: notif.is_read
            }));
          } catch (error) {
            console.error('Failed to fetch notifications:', error);
            return [];
          }
        };

        // Fetch all data in parallel
        const [payments, maintenanceRequests, landlord, communications, notifications] = await Promise.all([
          fetchPayments(),
          fetchMaintenanceRequests(),
          fetchLandlord(),
          fetchCommunications(),
          fetchNotifications(),
        ]);

        if (!mountedRef.current) return null;

        const upcomingPayments = payments.filter(p => p.status === 'pending');
        const recentPayments = payments.filter(p => p.status === 'paid');

        const result: OptimizedTenantDashboardData = {
          lease,
          payments,
          maintenanceRequests,
          landlord,
          upcomingPayments,
          recentPayments,
          communications,
          notifications,
        };

        console.log('Optimized tenant dashboard data fetched successfully');
        return result;

      } catch (error) {
        console.error('Error fetching optimized tenant dashboard data:', error);
        throw error;
      }
    },
    enabled: !!user?.id && mountedRef.current,
    retry: (failureCount, error) => {
      console.log(`Tenant dashboard query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 10000);
      console.log(`Retrying tenant dashboard query in ${delay}ms...`);
      return delay;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
