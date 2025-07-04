
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Phone, Mail } from 'lucide-react';
import { TenantData } from '@/hooks/useLandlordTenants';
import { getStatusBadge, getRentStatusText } from './utils';

interface TenantsListProps {
  tenants: TenantData[];
}

const TenantsList = ({ tenants }: TenantsListProps) => {
  return (
    <div className="space-y-4 md:hidden">
      {tenants.map((tenant) => (
        <Card key={tenant.id} className="shadow-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{tenant.name}</h3>
                <p className="text-sm text-gray-600">{tenant.property}</p>
              </div>
              <Badge className={getStatusBadge(tenant.rentStatus)}>
                {tenant.rentStatus}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>KES {tenant.rentAmount.toLocaleString()} / month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{getRentStatusText(tenant.daysUntilRent)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{tenant.email}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TenantsList;
