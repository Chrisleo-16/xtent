
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import DashboardHeader from '@/components/landlord-dashboard/DashboardHeader';
import SummaryCards from '@/components/landlord-dashboard/SummaryCards';
import QuickActions from '@/components/landlord-dashboard/QuickActions';
import RecentMaintenanceRequests from '@/components/landlord-dashboard/RecentMaintenanceRequests';
import DashboardCharts from '@/components/landlord-dashboard/DashboardCharts';
import { useLandlordDashboardData } from '@/hooks/useLandlordDashboardData';

const LandlordDashboard = () => {
  const { data, isLoading } = useLandlordDashboardData();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
          <AppSidebar role="landlord" />
          <SidebarInset>
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
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

  // Transform data to match SummaryCards expected format
  const stats = data ? {
    totalProperties: data.totalProperties,
    occupiedUnits: data.occupiedUnits,
    monthlyRevenue: data.monthlyIncome,
    pendingMaintenance: data.totalOpenRequests,
    pendingPayments: 0, // Add this if available in your data
    newInvitations: 0 // Add this if available in your data
  } : null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
        <AppSidebar role="landlord" />
        
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <SidebarTrigger />
              <NotificationBell variant="header" />
            </div>
            
            <DashboardHeader />
            <SummaryCards stats={stats} />
            <QuickActions />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <RecentMaintenanceRequests />
              <DashboardCharts />
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="landlord" />
    </SidebarProvider>
  );
};

export default LandlordDashboard;
