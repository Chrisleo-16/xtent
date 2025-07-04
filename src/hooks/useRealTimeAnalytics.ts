
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealTimeAnalytics = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time analytics subscriptions for user:', userId);

    // Subscribe to properties changes
    const propertiesChannel = supabase
      .channel('analytics-properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `landlord_id=eq.${userId}`
        },
        (payload) => {
          console.log('Properties change detected for analytics:', payload);
          queryClient.invalidateQueries({ queryKey: ['analytics-kpi', userId] });
          queryClient.invalidateQueries({ queryKey: ['analytics-properties', userId] });
        }
      )
      .subscribe();

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('analytics-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `landlord_id=eq.${userId}`
        },
        (payload) => {
          console.log('Payments change detected for analytics:', payload);
          queryClient.invalidateQueries({ queryKey: ['analytics-kpi', userId] });
          queryClient.invalidateQueries({ queryKey: ['rent-collection', userId] });
        }
      )
      .subscribe();

    // Subscribe to tenancies changes
    const tenanciesChannel = supabase
      .channel('analytics-tenancies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenancies',
          filter: `landlord_id=eq.${userId}`
        },
        (payload) => {
          console.log('Tenancies change detected for analytics:', payload);
          queryClient.invalidateQueries({ queryKey: ['analytics-kpi', userId] });
        }
      )
      .subscribe();

    // Subscribe to units changes
    const unitsChannel = supabase
      .channel('analytics-units-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'units'
        },
        (payload) => {
          console.log('Units change detected for analytics:', payload);
          queryClient.invalidateQueries({ queryKey: ['analytics-kpi', userId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up analytics real-time subscriptions...');
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(tenanciesChannel);
      supabase.removeChannel(unitsChannel);
    };
  }, [userId, queryClient]);
};
