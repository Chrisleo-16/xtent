
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

import { useSystemMetrics } from './admin-reports/hooks/useSystemMetrics';
import { useRevenueData } from './admin-reports/hooks/useRevenueData';
import { useUserDistribution } from './admin-reports/hooks/useUserDistribution';
import { usePropertyTypes } from './admin-reports/hooks/usePropertyTypes';

import { ReportsHeader } from './admin-reports/components/ReportsHeader';
import { KPICards } from './admin-reports/components/KPICards';
import { RevenueCharts } from './admin-reports/components/RevenueCharts';
import { UserDistributionCharts } from './admin-reports/components/UserDistributionCharts';
import { PropertyTypesSection } from './admin-reports/components/PropertyTypesSection';

const AdminReports = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');

  // Fetch all data using custom hooks
  const { data: systemMetrics, isLoading: metricsLoading } = useSystemMetrics(reportPeriod);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(reportPeriod, systemMetrics);
  const { data: userDistribution, isLoading: usersLoading } = useUserDistribution();
  const { data: propertyTypes, isLoading: typesLoading } = usePropertyTypes();

  const handleExportReport = (type: string) => {
    console.log(`Exporting ${type} report...`);
    // Implementation would generate and download the report
  };

  if (metricsLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar role="admin" />
          <SidebarInset>
            <div className="p-4 md:p-6">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading system analytics...</span>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!systemMetrics) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="admin" />
        
        <SidebarInset>
          <div className="p-4 md:p-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              {/* Header */}
              <ReportsHeader
                reportPeriod={reportPeriod}
                onReportPeriodChange={setReportPeriod}
                onExportReport={handleExportReport}
              />

              {/* KPI Cards */}
              <KPICards systemMetrics={systemMetrics} />

              {/* Charts */}
              <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                  <TabsTrigger value="users">User Distribution</TabsTrigger>
                  <TabsTrigger value="properties">Property Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-6">
                  <RevenueCharts revenueData={revenueData} isLoading={revenueLoading} />
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                  <UserDistributionCharts userDistribution={userDistribution} isLoading={usersLoading} />
                </TabsContent>

                <TabsContent value="properties" className="space-y-6">
                  <PropertyTypesSection propertyTypes={propertyTypes} isLoading={typesLoading} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminReports;
