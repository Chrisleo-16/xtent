
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import LandlordApplicationsManagement from '@/components/properties/LandlordApplicationsManagement';

const LandlordApplications = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role="landlord" />
        <SidebarInset>
          <div className="p-4 md:p-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Property Applications</h1>
                <p className="text-gray-600 mt-2">Review and manage tenant applications for your properties</p>
              </div>

              <LandlordApplicationsManagement />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default LandlordApplications;
