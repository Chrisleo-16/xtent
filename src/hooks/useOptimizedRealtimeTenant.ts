
import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useOptimizedRealtimeTenant = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isSubscribedRef.current) {
      return;
    }

    console.log('Setting up optimized realtime tenant subscription for user:', user.id);
    
    // Create unique channel name to avoid conflicts
    const channelName = `tenant-optimized-${user.id}-${Date.now()}`;
    
    // Debounced invalidation to prevent excessive queries
    let invalidateTimeout: NodeJS.Timeout;
    const debouncedInvalidate = () => {
      clearTimeout(invalidateTimeout);
      invalidateTimeout = setTimeout(() => {
        console.log('Invalidating tenant dashboard queries');
        queryClient.invalidateQueries({ queryKey: ['optimized-tenant-dashboard', user.id] });
      }, 500);
    };
    
    // Create and configure channel
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leases', filter: `tenant_id=eq.${user.id}` },
        () => {
          console.log('Lease change detected for tenant:', user.id);
          debouncedInvalidate();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments', filter: `tenant_id=eq.${user.id}` },
        () => {
          console.log('Payment change detected for tenant:', user.id);
          debouncedInvalidate();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests', filter: `tenant_id=eq.${user.id}` },
        () => {
          console.log('Maintenance request change detected for tenant:', user.id);
          debouncedInvalidate();
        }
      );

    // Subscribe only once
    isSubscribedRef.current = true;
    channelRef.current.subscribe((status: string) => {
      console.log('Tenant realtime subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        isSubscribedRef.current = false;
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up tenant realtime subscription');
      clearTimeout(invalidateTimeout);
      
      if (channelRef.current && isSubscribedRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        setIsConnected(false);
      }
    };
  }, [user?.id, queryClient]);

  return { isConnected };
};
