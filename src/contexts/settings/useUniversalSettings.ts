
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UniversalSettings } from './types';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export const useUniversalSettings = () => {
  const { user } = useAuth();
  const [universalSettings, setUniversalSettings] = useState<UniversalSettings | null>(null);

  const fetchUniversalSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching universal settings:', error);
      return;
    }

    if (!data && error?.code === 'PGRST116') {
      // Create default settings
      const { data: newSettings, error: createError } = await supabase
        .from('user_preferences')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default settings:', createError);
        return;
      }
      setUniversalSettings(newSettings);
    } else {
      setUniversalSettings(data);
    }
  };

  const updateUniversalSettings = async (updates: Partial<UniversalSettings>) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating universal settings:', error);
      toast.error('Failed to update settings');
      return;
    }

    toast.success('Settings updated successfully');
  };

  useEffect(() => {
    if (user) {
      fetchUniversalSettings();
    }
  }, [user]);

  // Set up real-time subscription
  const { addListener } = useRealtimeSubscription({
    channelName: user ? `user-preferences-${user.id}` : '',
    enabled: !!user,
    onSubscriptionChange: (status) => {
      console.log('Universal settings subscription status:', status);
    }
  });

  // Add the postgres changes listener only once when user changes
  useEffect(() => {
    if (user) {
      addListener(
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Universal settings updated:', payload.new);
          setUniversalSettings(payload.new as UniversalSettings);
        }
      );
    }
  }, [user?.id, addListener]);

  return {
    universalSettings,
    updateUniversalSettings,
    refreshUniversalSettings: fetchUniversalSettings,
  };
};
