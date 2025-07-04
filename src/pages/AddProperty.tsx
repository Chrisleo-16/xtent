
import EnhancedAddPropertyForm from '@/components/properties/EnhancedAddPropertyForm';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';

const AddProperty = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="landlord" />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            <EnhancedAddPropertyForm />
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role="landlord" />
    </SidebarProvider>
  );
};

export default AddProperty;
