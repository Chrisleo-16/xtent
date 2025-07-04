
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export interface UtilityBillWithDetails extends Tables<'utility_bills'> {
  properties?: {
    title: string;
    address: string;
  };
}

export const useUtilityBills = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['utility_bills', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('utility_bills')
        .select(`
          *,
          properties(title, address)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching utility bills:', error);
        throw new Error('Failed to fetch utility bills');
      }

      return data as UtilityBillWithDetails[];
    },
    enabled: !!user,
  });
};

export const useCreateUtilityBill = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bill: Omit<TablesInsert<'utility_bills'>, 'landlord_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('utility_bills')
        .insert({
          ...bill,
          landlord_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating utility bill:', error);
        throw new Error('Failed to create utility bill');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility_bills'] });
    },
  });
};

export const useUpdateUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tables<'utility_bills'>> }) => {
      const { data, error } = await supabase
        .from('utility_bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating utility bill:', error);
        throw new Error('Failed to update utility bill');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility_bills'] });
    },
  });
};
