
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Building, ArrowRightLeft, UserMinus } from 'lucide-react';

interface TenantCardProps {
  tenancy: {
    id: string;
    lease_start_date: string;
    lease_end_date: string;
    monthly_rent: number;
    units: {
      unit_number: string;
      unit_types: { name: string } | null;
    } | null;
    tenant_profile: {
      name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  };
  onChangeUnit: (tenancyId: string) => void;
  onEndLease: (tenancyId: string) => void;
}

const TenantCard = ({ tenancy, onChangeUnit, onEndLease }: TenantCardProps) => {
  const tenant = tenancy.tenant_profile;
  const unit = tenancy.units;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-lg">{tenant?.name || 'Unknown Tenant'}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Unit {unit?.unit_number} - {unit?.unit_types?.name}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {tenant?.email || 'No email'}
            </div>
            {tenant?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {tenant.phone}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            KES {tenancy.monthly_rent.toLocaleString()}/month
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Started: {new Date(tenancy.lease_start_date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Ends: {new Date(tenancy.lease_end_date).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChangeUnit(tenancy.id)}
          >
            <ArrowRightLeft className="h-4 w-4 mr-1" />
            Change Unit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEndLease(tenancy.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            End Lease
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenantCard;
