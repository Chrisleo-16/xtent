
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TenantData = {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    property: string | null;
    unit: string;
    rentAmount: number;
    leaseEnd: string;
    leaseId: string;
    rentStatus: 'paid' | 'pending' | 'overdue' | 'unknown';
    daysUntilRent: number;
};

const fetchTenants = async (landlordId: string): Promise<TenantData[]> => {
    // 1. Fetch active leases for the landlord
    const { data: leases, error: leasesError } = await supabase
        .from('leases')
        .select(`
            id,
            end_date,
            monthly_rent,
            tenant_id,
            property: properties!property_id!inner(id, title)
        `)
        .eq('landlord_id', landlordId)
        .eq('status', 'active');

    if (leasesError) throw new Error(leasesError.message);
    if (!leases || leases.length === 0) return [];

    const leaseIds = leases.map(l => l.id);
    const tenantIds = leases.map(l => l.tenant_id).filter((id): id is string => id !== null);

    if (tenantIds.length === 0) {
        return [];
    }

    // 2. Fetch tenant profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', tenantIds);

    if (profilesError) throw new Error(profilesError.message);
    const profilesById = new Map(profiles?.map(p => [p.id, p]));

    // 3. Fetch rent payments for these leases for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
    
    const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('lease_id, status, due_date')
        .in('lease_id', leaseIds)
        .eq('payment_type', 'rent')
        .gte('due_date', startOfMonth)
        .lte('due_date', endOfMonth);
    
    if (paymentsError) throw new Error(paymentsError.message);

    const paymentsByLeaseId = new Map<string, { status: string, due_date: string }>();
    if (payments) {
        for (const payment of payments) {
            if (payment.lease_id) {
                paymentsByLeaseId.set(payment.lease_id, { status: payment.status!, due_date: payment.due_date });
            }
        }
    }

    // 4. Combine the data into the TenantData structure
    return leases
      .map(lease => {
        const paymentInfo = paymentsByLeaseId.get(lease.id);
        const tenantInfo = lease.tenant_id ? profilesById.get(lease.tenant_id) : null;

        if (!tenantInfo) return null;

        let rentStatus: TenantData['rentStatus'] = 'unknown';
        let daysUntilRent = 0;

        if (paymentInfo) {
            rentStatus = paymentInfo.status as TenantData['rentStatus'];
            const dueDate = new Date(paymentInfo.due_date);
            // Adjust for timezone differences by only comparing dates
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            const diffTime = dueDateOnly.getTime() - todayDateOnly.getTime();
            daysUntilRent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
            id: tenantInfo.id,
            leaseId: lease.id,
            name: tenantInfo.name,
            email: tenantInfo.email,
            phone: tenantInfo.phone,
            property: lease.property!.title,
            unit: 'Main', // Unit info is not in DB, using a placeholder
            rentAmount: lease.monthly_rent,
            leaseEnd: lease.end_date,
            rentStatus,
            daysUntilRent,
        };
    }).filter((t): t is TenantData => t !== null);
};

export const useLandlordTenants = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['landlordTenants', user?.id],
        queryFn: () => fetchTenants(user!.id),
        enabled: !!user,
    });
};
