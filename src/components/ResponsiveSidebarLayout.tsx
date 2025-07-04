
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';

interface ResponsiveSidebarLayoutProps {
  children: React.ReactNode;
}

const ResponsiveSidebarLayout = ({ children }: ResponsiveSidebarLayoutProps) => {
  const { role } = useUserRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role={role} />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            {children}
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role={role} />
    </SidebarProvider>
  );
};

export default ResponsiveSidebarLayout;
