
import { useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import ManagePropertyContent from '@/components/properties/ManagePropertyContent';

const ManageProperty = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="landlord" />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            <ManagePropertyContent propertyId={id} />
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role="landlord" />
    </SidebarProvider>
  );
};

export default ManageProperty;
