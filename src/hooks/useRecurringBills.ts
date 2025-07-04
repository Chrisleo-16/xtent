
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export const useRecurringBills = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recurring_bills', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching recurring bills:', error);
        throw new Error('Failed to fetch recurring bills');
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useCreateRecurringBill = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bill: Omit<TablesInsert<'recurring_bills'>, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_bills')
        .insert({
          ...bill,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating recurring bill:', error);
        throw new Error('Failed to create recurring bill');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_bills'] });
    },
  });
};

export const useUpdateRecurringBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tables<'recurring_bills'>> }) => {
      const { data, error } = await supabase
        .from('recurring_bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating recurring bill:', error);
        throw new Error('Failed to update recurring bill');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_bills'] });
    },
  });
};

export const useDeleteRecurringBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_bills')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting recurring bill:', error);
        throw new Error('Failed to delete recurring bill');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_bills'] });
    },
  });
};
