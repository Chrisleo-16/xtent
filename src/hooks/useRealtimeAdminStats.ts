
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeAdminStats = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time subscriptions for admin dashboard...');

    // Subscribe to profiles changes (new users, verification status changes)
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles change detected:', payload);
          // Invalidate and refetch admin stats
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to properties changes
    const propertiesChannel = supabase
      .channel('admin-properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('Properties change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to maintenance requests for recent activities
    const maintenanceChannel = supabase
      .channel('admin-maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('New maintenance request:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up admin dashboard real-time subscriptions...');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, [queryClient]);
};
