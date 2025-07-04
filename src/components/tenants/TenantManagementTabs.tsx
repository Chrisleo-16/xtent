
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationsTable from './ApplicationsTable';
import InvitationsTable from './InvitationsTable';
import CurrentTenantsTable from './CurrentTenantsTable';
import { Users, UserPlus, Mail } from 'lucide-react';

interface TenantManagementTabsProps {
  landlordId: string;
}

const TenantManagementTabs = ({ landlordId }: TenantManagementTabsProps) => {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="applications" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Applied Tenants</span>
          <span className="sm:hidden">Applications</span>
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Invited Tenants</span>
          <span className="sm:hidden">Invitations</span>
        </TabsTrigger>
        <TabsTrigger value="current" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Current Tenants</span>
          <span className="sm:hidden">Current</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="applications" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable landlordId={landlordId} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invitations" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Sent Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <InvitationsTable landlordId={landlordId} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="current" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentTenantsTable landlordId={landlordId} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TenantManagementTabs;
