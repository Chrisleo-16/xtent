
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PropertyTypeData } from '../types';

export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ['admin-property-types'],
    queryFn: async (): Promise<PropertyTypeData[]> => {
      console.log('Fetching property types data...');

      const { data: propertiesData } = await supabase
        .from('properties')
        .select('custom_type');

      const typeCount = propertiesData?.reduce((acc: Record<string, number>, property) => {
        const type = property.custom_type || 'Apartment';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const total = Object.values(typeCount || {}).reduce((sum: number, count) => sum + Number(count), 0);

      return Object.entries(typeCount || {}).map(([type, count]) => ({
        type,
        count: Number(count),
        percentage: total > 0 ? parseFloat(((Number(count) / total) * 100).toFixed(1)) : 0
      }));
    }
  });
};
