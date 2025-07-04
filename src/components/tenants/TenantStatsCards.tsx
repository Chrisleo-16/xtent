
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Calendar } from 'lucide-react';
import { TenantData } from '@/hooks/useLandlordTenants';

interface TenantStatsCardsProps {
  tenants: TenantData[];
}

const TenantStatsCards = ({ tenants }: TenantStatsCardsProps) => {
  const totalTenants = tenants?.length || 0;
  const rentCollected = tenants?.filter(t => t.rentStatus === 'paid').reduce((sum, t) => sum + t.rentAmount, 0) || 0;
  const pendingPayments = tenants?.filter(t => t.rentStatus === 'pending').length || 0;
  const overduePayments = tenants?.filter(t => t.rentStatus === 'overdue').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalTenants}</div>
          <p className="text-xs text-muted-foreground">Active leases</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rent Collected</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            KES {rentCollected.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <Calendar className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingPayments}
          </div>
          <p className="text-xs text-muted-foreground">Due soon</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <Calendar className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {overduePayments}
          </div>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantStatsCards;
