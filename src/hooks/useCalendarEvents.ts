
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: string;
  priority: string;
  property_id?: string;
  tenant_id?: string;
  maintenance_request_id?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  recurring_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: string;
  priority: string;
  property_id?: string;
  tenant_id?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['calendar-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          properties:property_id(title),
          profiles:tenant_id(name)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      // Handle "none" values by converting them to null/undefined
      const cleanedData = {
        ...eventData,
        property_id: eventData.property_id === 'none' ? undefined : eventData.property_id,
        tenant_id: eventData.tenant_id === 'none' ? undefined : eventData.tenant_id,
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(cleanedData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    }
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CalendarEvent> }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    }
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    }
  });
};
