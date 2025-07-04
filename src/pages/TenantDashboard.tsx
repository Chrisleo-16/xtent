
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import DashboardHeader from '@/components/tenant-dashboard/DashboardHeader';
import InfoCards from '@/components/tenant-dashboard/InfoCards';
import QuickActions from '@/components/tenant-dashboard/QuickActions';
import MaintenanceRequests from '@/components/tenant-dashboard/MaintenanceRequests';
import PaymentHistory from '@/components/tenant-dashboard/PaymentHistory';
import PropertyContactInfo from '@/components/tenant-dashboard/PropertyContactInfo';
import { useTenantDashboardData } from '@/hooks/useTenantDashboardData';

const TenantDashboard = () => {
  const { data, isLoading } = useTenantDashboardData();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
          <AppSidebar role="tenant" />
          <SidebarInset>
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!data || !data.lease) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
          <AppSidebar role="tenant" />
          <SidebarInset>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <SidebarTrigger />
                <NotificationBell variant="header" />
              </div>
              <div className="text-center py-10">
                <p className="text-gray-600">No active lease found. Please contact your landlord.</p>
              </div>
            </div>
          </SidebarInset>
        </div>
        <MobileNavigation role="tenant" />
      </SidebarProvider>
    );
  }

  // Transform data for InfoCards component
  const nextRentPayment = data.payments?.find(payment => 
    payment.status === 'pending' && payment.payment_type === 'rent'
  );
  const lastPayment = data.payments?.find(payment => 
    payment.status === 'paid' && payment.paid_date
  );
  const openMaintenanceRequests = data.maintenanceRequests?.filter(req => 
    req.status !== 'completed'
  ) || [];

  // Create payment history for chart
  const paymentHistory = data.payments?.slice(0, 6).map(payment => ({
    month: new Date(payment.paid_date || payment.due_date).toLocaleDateString('en-US', { month: 'short' }),
    amount: payment.amount
  })) || [];

  // Transform lease data to match OptimizedLease structure expected by PropertyContactInfo
  const transformedLease = {
    id: data.lease.id,
    property_id: data.lease.property_id,
    monthly_rent: data.lease.monthly_rent,
    start_date: data.lease.start_date,
    end_date: data.lease.end_date,
    status: data.lease.status,
    property: {
      id: data.lease.properties?.id || '',
      title: data.lease.properties?.title || '',
      address: data.lease.properties?.address || '',
      bedrooms: data.lease.properties?.bedrooms,
      bathrooms: data.lease.properties?.bathrooms,
      size_sqft: data.lease.properties?.size_sqft,
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
        <AppSidebar role="tenant" />
        
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <SidebarTrigger />
              <NotificationBell variant="header" />
            </div>
            
            <DashboardHeader />
            <InfoCards 
              nextRentPayment={nextRentPayment}
              lastPayment={lastPayment}
              openMaintenanceRequests={openMaintenanceRequests}
            />
            <QuickActions />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <MaintenanceRequests maintenanceRequests={data.maintenanceRequests || []} />
              <PaymentHistory paymentHistory={paymentHistory} />
            </div>
            <PropertyContactInfo lease={transformedLease} landlord={data.landlord} />
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="tenant" />
    </SidebarProvider>
  );
};

export default TenantDashboard;
