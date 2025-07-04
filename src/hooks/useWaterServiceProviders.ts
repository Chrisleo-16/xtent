
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WaterServiceProvider {
  id: string;
  name: string;
  code: string;
  county: string;
  coverage_areas: string[];
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  paybill_number?: string;
  account_format?: string;
  is_active: boolean;
}

export const useWaterServiceProviders = () => {
  return useQuery({
    queryKey: ['water-service-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_service_providers')
        .select('*')
        .eq('is_active', true)
        .order('county', { ascending: true });

      if (error) throw error;
      return data as WaterServiceProvider[];
    },
  });
};

export const useWaterServiceProvidersByCounty = (county?: string) => {
  return useQuery({
    queryKey: ['water-service-providers', county],
    queryFn: async () => {
      let query = supabase
        .from('water_service_providers')
        .select('*')
        .eq('is_active', true);

      if (county) {
        query = query.eq('county', county);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return data as WaterServiceProvider[];
    },
    enabled: !!county,
  });
};
