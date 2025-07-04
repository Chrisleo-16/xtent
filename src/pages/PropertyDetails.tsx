
import EnhancedPropertyDetailsPage from '@/components/properties/EnhancedPropertyDetailsPage';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const PropertyDetails = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  
  // Use actual user role or default to tenant for unauthenticated users
  const userRole = role || 'tenant';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role={userRole} />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            <EnhancedPropertyDetailsPage />
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role={userRole} />
    </SidebarProvider>
  );
};

export default PropertyDetails;
