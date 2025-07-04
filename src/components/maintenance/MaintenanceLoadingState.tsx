
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';

const MaintenanceLoadingState = () => {
  const { role } = useUserRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role={role} />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                <p className="mt-6 text-gray-600 font-medium">Loading maintenance requests...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role={role} />
    </SidebarProvider>
  );
};

export default MaintenanceLoadingState;
export { MaintenanceLoadingState };
