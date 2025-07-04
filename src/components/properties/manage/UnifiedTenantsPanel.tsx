
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck } from 'lucide-react';
import AppliedTenantsTab from './AppliedTenantsTab';
import CurrentTenantsTab from './CurrentTenantsTab';

interface UnifiedTenantsPanelProps {
  propertyId: string;
}

const UnifiedTenantsPanel = ({ propertyId }: UnifiedTenantsPanelProps) => {
  const [activeTab, setActiveTab] = useState('applied');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tenant Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applied" className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Applied Tenants
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Current Tenants
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applied" className="mt-4">
            <AppliedTenantsTab propertyId={propertyId} />
          </TabsContent>

          <TabsContent value="current" className="mt-4">
            <CurrentTenantsTab propertyId={propertyId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedTenantsPanel;
