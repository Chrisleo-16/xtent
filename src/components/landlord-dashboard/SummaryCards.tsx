
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, DollarSign, AlertTriangle, CreditCard, Mail } from 'lucide-react';
import { OptimizedDashboardStats } from '@/hooks/useOptimizedRealtimeLandlord';
import { formatCurrency } from '@/lib/formatCurrency';

interface SummaryCardsProps {
  stats: OptimizedDashboardStats | null;
}

const SummaryCards = ({ stats }: SummaryCardsProps) => {
  const cards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties || 0,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Occupied Units',
      value: stats?.occupiedUnits || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Maintenance',
      value: stats?.pendingMaintenance || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'New Invitations',
      value: stats?.newInvitations || 0,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;
