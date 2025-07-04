
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import TenantManagementTabs from '@/components/tenants/TenantManagementTabs';
import { AlertCircle } from 'lucide-react';

const Tenants = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access tenant management.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="landlord" />
        
        <SidebarInset>
          <div className="p-4 md:p-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Tenant Management
                </h1>
                <p className="text-gray-600">
                  Manage applications, invitations, and current tenancies across all your properties.
                </p>
              </div>

              {/* Main Content */}
              <TenantManagementTabs landlordId={user.id} />
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="landlord" />
    </SidebarProvider>
  );
};

export default Tenants;
