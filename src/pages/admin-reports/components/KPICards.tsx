
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Building, TrendingUp } from 'lucide-react';
import { SystemMetrics } from '../types';

interface KPICardsProps {
  systemMetrics: SystemMetrics;
}

export const KPICards = ({ systemMetrics }: KPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card className="shadow-md border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            KES {systemMetrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            +{systemMetrics.monthlyGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemMetrics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Active platform users
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Building className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemMetrics.totalProperties}</div>
          <p className="text-xs text-muted-foreground">
            Listed properties
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemMetrics.occupancyRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Platform average
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{systemMetrics.monthlyGrowth}%</div>
          <p className="text-xs text-muted-foreground">
            Monthly growth
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
