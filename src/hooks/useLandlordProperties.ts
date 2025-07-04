
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useLandlordProperties = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['landlordProperties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(url, is_thumbnail, display_order)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

// Export as default as well for compatibility
export default useLandlordProperties;
