
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LandlordSettings } from './types';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export const useLandlordSettings = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [landlordSettings, setLandlordSettings] = useState<LandlordSettings | null>(null);

  const fetchLandlordSettings = async () => {
    if (!user || role !== 'landlord') return;

    const { data, error } = await supabase
      .from('landlord_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching landlord settings:', error);
      return;
    }

    if (!data && error?.code === 'PGRST116') {
      // Create default landlord settings
      const { data: newSettings, error: createError } = await supabase
        .from('landlord_settings')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default landlord settings:', createError);
        return;
      }
      setLandlordSettings(newSettings);
    } else {
      setLandlordSettings(data);
    }
  };

  const updateLandlordSettings = async (updates: Partial<LandlordSettings>) => {
    if (!user) return;

    const { error } = await supabase
      .from('landlord_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating landlord settings:', error);
      toast.error('Failed to update landlord settings');
      return;
    }

    toast.success('Landlord settings updated successfully');
  };

  useEffect(() => {
    if (user && role === 'landlord') {
      fetchLandlordSettings();
    }
  }, [user, role]);

  // Set up real-time subscription
  const { addListener } = useRealtimeSubscription({
    channelName: user && role === 'landlord' ? `landlord-settings-${user.id}` : '',
    enabled: !!(user && role === 'landlord'),
    onSubscriptionChange: (status) => {
      console.log('Landlord settings subscription status:', status);
    }
  });

  // Add the postgres changes listener
  useEffect(() => {
    if (user && role === 'landlord') {
      addListener(
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'landlord_settings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Landlord settings updated:', payload.new);
          setLandlordSettings(payload.new as LandlordSettings);
        }
      );
    }
  }, [user?.id, role, addListener]);

  return {
    landlordSettings,
    updateLandlordSettings,
    refreshLandlordSettings: fetchLandlordSettings,
  };
};
