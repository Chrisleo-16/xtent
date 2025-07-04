
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TenantBillsHeader,
  TenantBillsSummaryCards,
  TenantBillsSearchFilter,
  TenantBillsTable,
  TenantBillsCards,
  TenantBillsEmptyState,
  Bill
} from '@/components/tenant-bills';

const TenantBills = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bills, isLoading, error } = useQuery({
    queryKey: ['tenant_bills', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', user.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error.message);
        throw new Error('Failed to fetch bills');
      }

      return (data || []).map((bill): Bill => ({
        id: bill.id,
        description: bill.notes || `${bill.payment_type.charAt(0).toUpperCase() + bill.payment_type.slice(1)} Bill`,
        amount: bill.amount || 0,
        dueDate: bill.due_date,
        paidDate: bill.paid_date,
        status: bill.status || 'pending',
        type: bill.payment_type,
      }));
    },
    enabled: !!user,
  });

  const filteredBills = (bills || []).filter(bill => {
    const matchesSearch = bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = (bills || []).reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = (bills || []).filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = (bills || []).filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = (bills || []).filter(bill => bill.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0);

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar role="tenant" />
          <SidebarInset>
            <div className="p-4">
              <SidebarTrigger className="mb-4" />
              <div className="animate-pulse">
                <Skeleton className="h-48 w-full mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <Skeleton className="h-24 w-full mb-6" />
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </SidebarInset>
        </div>
        <MobileNavigation role="tenant" />
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar role="tenant" />
          <SidebarInset>
            <div className="p-4">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <h2 className="mt-4 text-xl font-semibold">Error Fetching Bills</h2>
                  <p className="mt-2 text-gray-600">Could not load your payment information. Please try again later.</p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
        <MobileNavigation role="tenant" />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20">
        <AppSidebar role="tenant" />
        
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            
            <TenantBillsHeader />

            <TenantBillsSummaryCards
              totalAmount={totalAmount}
              paidAmount={paidAmount}
              pendingAmount={pendingAmount}
              overdueAmount={overdueAmount}
            />

            <TenantBillsSearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            <TenantBillsTable bills={filteredBills} />

            <TenantBillsCards bills={filteredBills} />

            {filteredBills.length === 0 && !isLoading && <TenantBillsEmptyState />}
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="tenant" />
    </SidebarProvider>
  );
};

export default TenantBills;
