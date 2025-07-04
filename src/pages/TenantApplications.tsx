
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import EnhancedTenantApplicationsTracker from '@/components/tenant/EnhancedTenantApplicationsTracker';

const TenantApplications = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role="tenant" />
        <SidebarInset>
          <div className="p-4 md:p-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">My Applications & Leases</h1>
                <p className="text-gray-600 mt-2">Track your property applications and manage your current lease</p>
              </div>

              <EnhancedTenantApplicationsTracker />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TenantApplications;
