
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TenantSettings } from './types';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export const useTenantSettings = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);

  const fetchTenantSettings = async () => {
    if (!user || role !== 'tenant') return;

    const { data, error } = await supabase
      .from('tenant_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching tenant settings:', error);
      return;
    }

    if (!data && error?.code === 'PGRST116') {
      // Create default tenant settings
      const { data: newSettings, error: createError } = await supabase
        .from('tenant_settings')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default tenant settings:', createError);
        return;
      }
      setTenantSettings(newSettings);
    } else {
      setTenantSettings(data);
    }
  };

  const updateTenantSettings = async (updates: Partial<TenantSettings>) => {
    if (!user) return;

    const { error } = await supabase
      .from('tenant_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating tenant settings:', error);
      toast.error('Failed to update tenant settings');
      return;
    }

    toast.success('Tenant settings updated successfully');
  };

  useEffect(() => {
    if (user && role === 'tenant') {
      fetchTenantSettings();
    }
  }, [user, role]);

  // Set up real-time subscription
  const { addListener } = useRealtimeSubscription({
    channelName: user && role === 'tenant' ? `tenant-settings-${user.id}` : '',
    enabled: !!(user && role === 'tenant'),
    onSubscriptionChange: (status) => {
      console.log('Tenant settings subscription status:', status);
    }
  });

  // Add the postgres changes listener
  useEffect(() => {
    if (user && role === 'tenant') {
      addListener(
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenant_settings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Tenant settings updated:', payload.new);
          setTenantSettings(payload.new as TenantSettings);
        }
      );
    }
  }, [user?.id, role, addListener]);

  return {
    tenantSettings,
    updateTenantSettings,
    refreshTenantSettings: fetchTenantSettings,
  };
};
