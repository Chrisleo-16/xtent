
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFeaturedProperties = () => {
  return useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name),
          landlord:profiles!properties_landlord_id_fkey (
            id,
            name,
            verification_status
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching featured properties:', error);
        throw error;
      }

      console.log('Fetched featured properties:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
