
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionConfig {
  channelName: string;
  enabled?: boolean;
  onSubscriptionChange?: (status: string) => void;
}

interface PostgresChangesConfig {
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  filter?: string;
}

export const useRealtimeSubscription = (config: SubscriptionConfig) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const listenersRef = useRef<Array<{ config: PostgresChangesConfig; callback: (payload: any) => void }>>([]);
  const cleanupRef = useRef<() => void>();

  const cleanup = useCallback(() => {
    console.log('Cleaning up realtime subscription:', config.channelName);
    
    if (channelRef.current && isSubscribedRef.current) {
      try {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    
    channelRef.current = null;
    isSubscribedRef.current = false;
    listenersRef.current = [];
  }, [config.channelName]);

  const addListener = useCallback((eventConfig: PostgresChangesConfig, callback: (payload: any) => void) => {
    // Store the listener configuration
    listenersRef.current.push({ config: eventConfig, callback });
    
    // If channel is already subscribed, add the listener immediately
    if (channelRef.current && isSubscribedRef.current) {
      channelRef.current.on('postgres_changes', eventConfig, callback);
    }
  }, []);

  useEffect(() => {
    if (!config.enabled || !config.channelName) {
      cleanup();
      return;
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current && channelRef.current) {
      return;
    }

    console.log('Setting up realtime subscription:', config.channelName);
    
    try {
      // Create a unique channel
      const timestamp = Date.now();
      const uniqueChannelName = `${config.channelName}-${timestamp}`;
      channelRef.current = supabase.channel(uniqueChannelName);
      
      // Add all pending listeners
      listenersRef.current.forEach(({ config: eventConfig, callback }) => {
        channelRef.current.on('postgres_changes', eventConfig, callback);
      });
      
      // Subscribe with status callback
      channelRef.current.subscribe((status: string) => {
        console.log(`Subscription ${uniqueChannelName} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isSubscribedRef.current = false;
        }
        
        config.onSubscriptionChange?.(status);
      });

    } catch (error) {
      console.error('Error setting up subscription:', error);
      cleanup();
    }

    // Store cleanup function
    cleanupRef.current = cleanup;

    // Cleanup on unmount
    return cleanup;
  }, [config.enabled, config.channelName, cleanup]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    channel: channelRef.current,
    isSubscribed: isSubscribedRef.current,
    addListener
  };
};
