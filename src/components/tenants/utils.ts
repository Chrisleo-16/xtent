
import { TenantData } from '@/hooks/useLandlordTenants';

export const getStatusBadge = (status: TenantData['rentStatus']) => {
  const statusColors: Record<TenantData['rentStatus'], string> = {
    'paid': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
    'unknown': 'bg-gray-100 text-gray-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getRentStatusText = (daysUntilRent: number) => {
  if (daysUntilRent < 0) return `${Math.abs(daysUntilRent)} days overdue`;
  if (daysUntilRent === 0) return 'Due today';
  return `Due in ${daysUntilRent} days`;
};
