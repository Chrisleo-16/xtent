
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PaymentWithTenant {
  id: string;
  tenant_name: string;
  tenant_email: string;
  property_title: string;
  unit: string;
  due_date: string;
  amount: number;
  status: string;
  paid_date: string | null;
  transaction_reference: string | null;
  payment_type: string;
}

export const useLandlordPayments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['landlord_payments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          tenant:profiles!payments_tenant_id_fkey(name, email),
          lease:leases(property:properties(title))
        `)
        .eq('landlord_id', user.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw new Error('Failed to fetch payments');
      }

      return (data || []).map((payment): PaymentWithTenant => ({
        id: payment.id,
        tenant_name: payment.tenant?.name || 'Unknown Tenant',
        tenant_email: payment.tenant?.email || '',
        property_title: payment.lease?.property?.title || 'Unknown Property',
        unit: `Unit ${Math.floor(Math.random() * 999) + 1}`, // Temporary until we have unit data
        due_date: payment.due_date,
        amount: payment.amount,
        status: payment.status || 'pending',
        paid_date: payment.paid_date,
        transaction_reference: payment.transaction_reference,
        payment_type: payment.payment_type,
      }));
    },
    enabled: !!user,
  });
};
