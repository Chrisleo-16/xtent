
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { TenancyWithTenant } from '../types/tenancy';
import { getStatusColor } from '../utils/tenancyUtils';

interface TenancyCardProps {
  tenancy: TenancyWithTenant;
  onEdit: (tenancy: TenancyWithTenant) => void;
  onEndTenancy: (tenancyId: string) => void;
  isEndingTenancy: boolean;
}

const TenancyCard = ({ tenancy, onEdit, onEndTenancy, isEndingTenancy }: TenancyCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {tenancy.tenant?.name || 'Unknown Tenant'}
          </CardTitle>
          <Badge className={getStatusColor(tenancy.status)}>
            {tenancy.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Tenant</p>
              <p className="font-medium">{tenancy.tenant?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{tenancy.tenant?.email || 'N/A'}</p>
              {tenancy.tenant?.phone && (
                <p className="text-sm text-gray-500">{tenancy.tenant.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Lease Period</p>
              <p className="font-medium">
                {new Date(tenancy.lease_start_date).toLocaleDateString()} - {' '}
                {new Date(tenancy.lease_end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="font-medium">{formatCurrency(tenancy.monthly_rent)}</p>
              {tenancy.security_deposit > 0 && (
                <p className="text-sm text-gray-500">
                  Deposit: {formatCurrency(tenancy.security_deposit)}
                </p>
              )}
            </div>
          </div>
        </div>

        {tenancy.unit && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Unit</p>
            <p className="font-medium">
              {tenancy.unit.unit_number} 
              {tenancy.unit.unit_type?.name && ` (${tenancy.unit.unit_type.name})`}
            </p>
          </div>
        )}

        {tenancy.lease_terms && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Lease Terms</p>
            <p className="text-sm bg-gray-50 p-2 rounded">{tenancy.lease_terms}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tenancy)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {tenancy.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEndTenancy(tenancy.id)}
              disabled={isEndingTenancy}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              End Tenancy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenancyCard;
