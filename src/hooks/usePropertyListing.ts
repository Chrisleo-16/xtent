
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const usePropertyListing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateListingStatus = useMutation({
    mutationFn: async ({ propertyId, isListed }: { propertyId: string; isListed: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .update({ 
          status: isListed ? 'available' : 'maintenance',
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .eq('landlord_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      queryClient.invalidateQueries({ queryKey: ['property', data.id] });
      queryClient.invalidateQueries({ queryKey: ['public-listings'] });
      const status = data.status === 'available' ? 'listed' : 'unlisted';
      toast.success(`Property ${status} successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update listing status: ${error.message}`);
    }
  });

  const listProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      return updateListingStatus.mutateAsync({ propertyId, isListed: true });
    }
  });

  const unlistProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      return updateListingStatus.mutateAsync({ propertyId, isListed: false });
    }
  });

  return {
    updateListingStatus,
    listProperty,
    unlistProperty
  };
};
