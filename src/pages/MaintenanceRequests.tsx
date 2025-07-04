
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MaintenanceRequests = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('property');
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="landlord" />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                      <Wrench className="h-6 w-6" />
                      Maintenance Requests
                    </h1>
                    {propertyId && (
                      <p className="text-gray-600 text-sm">
                        Filtered by property
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Maintenance System Coming Soon
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      The maintenance request system is being developed. 
                      You'll be able to track, assign, and manage maintenance requests here.
                    </p>
                    {propertyId && (
                      <Button 
                        onClick={() => navigate(`/manage-property/${propertyId}`)} 
                        className="mt-4 bg-green-600 hover:bg-green-700"
                      >
                        Return to Property Management
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role="landlord" />
    </SidebarProvider>
  );
};

export default MaintenanceRequests;
