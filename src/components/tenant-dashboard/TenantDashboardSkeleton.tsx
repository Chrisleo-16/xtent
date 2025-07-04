
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const TenantDashboardSkeleton = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-gray-50 animate-pulse">
      <AppSidebar role="tenant" />
      <SidebarInset>
        <div className="p-4">
          <SidebarTrigger className="mb-4" />
          <Skeleton className="h-48 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </SidebarInset>
    </div>
  </SidebarProvider>
);

export default TenantDashboardSkeleton;
