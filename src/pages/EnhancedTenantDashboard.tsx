
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import EnhancedTenantDashboard from '@/components/tenant-dashboard/EnhancedTenantDashboard';

const EnhancedTenantDashboardPage = () => {
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
            
            <EnhancedTenantDashboard />
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="tenant" />
    </SidebarProvider>
  );
};

export default EnhancedTenantDashboardPage;
