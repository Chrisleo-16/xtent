
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const usePropertyTypes = () => {
  const [retryCount, setRetryCount] = useState(0);

  const query = useQuery({
    queryKey: ['propertyTypes', retryCount],
    queryFn: async () => {
      console.log('Fetching property types...');
      
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching property types:', error);
        throw error;
      }

      console.log('Property types fetched:', data?.length || 0);
      return data || [];
    },
    retry: (failureCount, error) => {
      console.log(`Property types query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 10000);
      console.log(`Retrying property types query in ${delay}ms...`);
      return delay;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - property types don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const retry = () => {
    console.log('Manual retry for property types');
    setRetryCount(prev => prev + 1);
  };

  return {
    ...query,
    retry,
  };
};
