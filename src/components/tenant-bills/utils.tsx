
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  type: string;
}

export const getStatusIcon = (status: string) => {
  const icons = {
    'paid': <CheckCircle className="h-4 w-4 text-green-600" />,
    'pending': <Clock className="h-4 w-4 text-yellow-600" />,
    'overdue': <AlertCircle className="h-4 w-4 text-red-600" />
  };
  return icons[status as keyof typeof icons] || icons.pending;
};

export const getStatusBadge = (status: string) => {
  const statusConfig = {
    'paid': { color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', icon: CheckCircle },
    'pending': { color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white', icon: Clock },
    'overdue': { color: 'bg-gradient-to-r from-red-500 to-red-600 text-white', icon: AlertCircle }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;
  
  return (
    <Badge className={`${config.color} px-3 py-1 rounded-full shadow-lg border-0 flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
