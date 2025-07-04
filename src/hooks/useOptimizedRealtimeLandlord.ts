
import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OptimizedDashboardStats {
  totalProperties: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  pendingPayments: number;
  newInvitations: number;
}

export const useOptimizedRealtimeLandlord = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const subscriptionStateRef = useRef<'idle' | 'subscribing' | 'subscribed' | 'unsubscribing'>('idle');

  // Optimized dashboard data query
  const { data: dashboardStats, isLoading, error } = useQuery({
    queryKey: ['optimized-landlord-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('📊 Fetching optimized landlord dashboard data');

      // Parallel queries for better performance
      const [
        propertiesResult,
        leasesResult,
        paymentsResult,
        maintenanceResult,
        invitationsResult
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('landlord_id', user.id),
        supabase.from('leases').select('id', { count: 'exact', head: true }).eq('landlord_id', user.id).eq('status', 'active'),
        supabase.from('payments').select('amount, status, paid_date').eq('landlord_id', user.id),
        supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }).eq('landlord_id', user.id).eq('status', 'pending'),
        supabase.from('tenant_invitations').select('id', { count: 'exact', head: true }).eq('landlord_id', user.id).eq('status', 'pending'),
      ]);

      // Calculate monthly revenue from payments data
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const monthlyRevenue = paymentsResult.data
        ?.filter(p => 
          p.status === 'paid' && 
          p.paid_date &&
          new Date(p.paid_date) >= startOfMonth && 
          new Date(p.paid_date) <= endOfMonth
        )
        .reduce((sum, payment) => sum + payment.amount, 0) || 0;

      const pendingPayments = paymentsResult.data?.filter(p => p.status === 'pending').length || 0;

      const stats: OptimizedDashboardStats = {
        totalProperties: propertiesResult.count || 0,
        occupiedUnits: leasesResult.count || 0,
        monthlyRevenue,
        pendingMaintenance: maintenanceResult.count || 0,
        pendingPayments,
        newInvitations: invitationsResult.count || 0,
      };

      console.log('✅ Landlord dashboard stats loaded:', stats);
      return stats;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Cleanup function
  const cleanupChannel = () => {
    if (channelRef.current && subscriptionStateRef.current !== 'idle') {
      console.log('🧹 Cleaning up landlord realtime channel');
      subscriptionStateRef.current = 'unsubscribing';
      
      (async () => {
        try {
          await channelRef.current.unsubscribe();
          await supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error during landlord channel cleanup:', error);
        }
      })();
      
      channelRef.current = null;
      subscriptionStateRef.current = 'idle';
      setIsConnected(false);
    }
  };

  // Set up optimized real-time listeners
  useEffect(() => {
    if (!user?.id) {
      cleanupChannel();
      return;
    }

    if (subscriptionStateRef.current !== 'idle') {
      return;
    }

    console.log('🔌 Setting up optimized landlord realtime for user:', user.id);
    subscriptionStateRef.current = 'subscribing';

    const channelName = `landlord-dashboard-${user.id}-${Date.now()}`;
    
    // Single consolidated channel for all landlord dashboard updates
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties', filter: `landlord_id=eq.${user.id}` },
        () => {
          console.log('🏠 Properties updated');
          queryClient.invalidateQueries({ queryKey: ['optimized-landlord-dashboard', user.id] });
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leases', filter: `landlord_id=eq.${user.id}` },
        () => {
          console.log('📄 Leases updated');
          queryClient.invalidateQueries({ queryKey: ['optimized-landlord-dashboard', user.id] });
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments', filter: `landlord_id=eq.${user.id}` },
        () => {
          console.log('💰 Payments updated');
          queryClient.invalidateQueries({ queryKey: ['optimized-landlord-dashboard', user.id] });
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tenant_invitations', filter: `landlord_id=eq.${user.id}` },
        () => {
          console.log('📩 Tenant invitations updated');
          queryClient.invalidateQueries({ queryKey: ['optimized-landlord-dashboard', user.id] });
        }
      );

    channelRef.current.subscribe((status: string) => {
      console.log('📡 Landlord realtime status:', status);
      
      if (status === 'SUBSCRIBED') {
        subscriptionStateRef.current = 'subscribed';
        setIsConnected(true);
        console.log('✅ Landlord realtime connected');
      } else if (status === 'CLOSED') {
        subscriptionStateRef.current = 'idle';
        setIsConnected(false);
      } else if (status === 'CHANNEL_ERROR') {
        subscriptionStateRef.current = 'idle';
        setIsConnected(false);
        console.error('❌ Landlord realtime error');
      }
    });

    return cleanupChannel;
  }, [user?.id, queryClient]);

  return {
    dashboardStats,
    isLoading,
    error,
    isConnected,
  };
};
