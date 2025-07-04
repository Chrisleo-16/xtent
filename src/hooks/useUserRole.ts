
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const { user } = useAuth();
  
  const { data: roleData, isLoading, error, refetch } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data?.role || 'tenant';
    },
    enabled: !!user?.id,
  });

  const role = roleData || user?.user_metadata?.role || 'tenant';
  
  return {
    role: role as 'landlord' | 'tenant' | 'admin' | 'caretaker',
    isLandlord: role === 'landlord',
    isTenant: role === 'tenant',
    isAdmin: role === 'admin',
    isCaretaker: role === 'caretaker',
    isLoading,
    error,
    refetch,
  };
};
