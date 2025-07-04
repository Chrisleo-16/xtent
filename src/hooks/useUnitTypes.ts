
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUnitTypes = () => {
  return useQuery({
    queryKey: ['unitTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};
