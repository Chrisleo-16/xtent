
import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DashboardStats {
  totalProperties: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  pendingPayments: number;
  newApplications: number;
}

export const useRealtimeDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const subscriptionStateRef = useRef<'idle' | 'subscribing' | 'subscribed' | 'unsubscribing'>('idle');

  // Main dashboard data query
  const { data: dashboardStats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id);

      // Get occupied units (active leases)
      const { count: occupiedUnits } = await supabase
        .from('leases')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .eq('status', 'active');

      // Get monthly revenue (current month paid payments)
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('landlord_id', user.id)
        .eq('status', 'paid')
        .gte('paid_date', startOfMonth.toISOString())
        .lte('paid_date', endOfMonth.toISOString());

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get pending maintenance requests
      const { count: pendingMaintenance } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .eq('status', 'pending');

      // Get pending payments
      const { count: pendingPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .eq('status', 'pending');

      // Get new applications (renamed from invitations)
      const { count: newApplications } = await supabase
        .from('tenant_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .eq('status', 'pending');

      return {
        totalProperties: totalProperties || 0,
        occupiedUnits: occupiedUnits || 0,
        monthlyRevenue: monthlyRevenue,
        pendingMaintenance: pendingMaintenance || 0,
        pendingPayments: pendingPayments || 0,
        newApplications: newApplications || 0,
      } as DashboardStats;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute as fallback
  });

  // Cleanup function (synchronous)
  const cleanupChannel = () => {
    if (channelRef.current && subscriptionStateRef.current !== 'idle') {
      console.log('Cleaning up dashboard channel subscription');
      subscriptionStateRef.current = 'unsubscribing';
      
      // Perform async cleanup without blocking
      (async () => {
        try {
          await channelRef.current.unsubscribe();
          await supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error during channel cleanup:', error);
        }
      })();
      
      channelRef.current = null;
      subscriptionStateRef.current = 'idle';
      setIsConnected(false);
    }
  };

  // Set up real-time listeners
  useEffect(() => {
    if (!user?.id) {
      cleanupChannel();
      return;
    }

    // Prevent multiple subscriptions
    if (subscriptionStateRef.current !== 'idle') {
      return;
    }

    console.log('Setting up dashboard real-time subscriptions for user:', user.id);
    subscriptionStateRef.current = 'subscribing';

    // Create a unique channel name
    const channelName = `dashboard-updates-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties', filter: `landlord_id=eq.${user.id}` },
        (payload) => {
          console.log('Properties change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
          toast.success('Property data updated');
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leases', filter: `landlord_id=eq.${user.id}` },
        (payload) => {
          console.log('Leases change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
          toast.success('Lease data updated');
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments', filter: `landlord_id=eq.${user.id}` },
        (payload) => {
          console.log('Payments change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
          toast.success('Payment data updated');
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests', filter: `landlord_id=eq.${user.id}` },
        (payload) => {
          console.log('Maintenance requests change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
          toast.success('Maintenance request updated');
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tenant_invitations', filter: `landlord_id=eq.${user.id}` },
        (payload) => {
          console.log('Tenant applications change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
          toast.success('Application status updated');
        }
      );

    // Subscribe with proper error handling
    channelRef.current.subscribe((status: string) => {
      console.log('Dashboard channel subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        subscriptionStateRef.current = 'subscribed';
        setIsConnected(true);
        console.log('Dashboard real-time updates connected');
      } else if (status === 'CLOSED') {
        subscriptionStateRef.current = 'idle';
        setIsConnected(false);
        console.log('Dashboard real-time updates disconnected');
      } else if (status === 'CHANNEL_ERROR') {
        subscriptionStateRef.current = 'idle';
        setIsConnected(false);
        console.error('Dashboard real-time subscription error');
      }
    });

    // Return synchronous cleanup function
    return cleanupChannel;
  }, [user?.id, queryClient]);

  return {
    dashboardStats,
    isLoading,
    error,
    isConnected,
  };
};
