
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, CheckCircle, AlertCircle, Wrench, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { MaintenanceRequestWithDetails } from '@/hooks/useMaintenanceRequests';

interface MaintenanceRequestCardProps {
  request: MaintenanceRequestWithDetails;
  userRole: string;
  onUpdateStatus: (id: string, status: string, request: any) => Promise<void>;
  onStartChat: (request: any) => void;
}

export const MaintenanceRequestCard = ({ 
  request, 
  userRole, 
  onUpdateStatus, 
  onStartChat 
}: MaintenanceRequestCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-500', icon: Clock },
      'in_progress': { color: 'bg-blue-500', icon: Wrench },
      'completed': { color: 'bg-green-500', icon: CheckCircle },
      'cancelled': { color: 'bg-gray-500', icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1 text-xs`}>
        <IconComponent className="w-3 h-3" />
        <span className="hidden sm:inline">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'border-l-red-500',
      'medium': 'border-l-yellow-500',
      'low': 'border-l-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <Card className={`border-l-4 ${getPriorityColor(request.priority || 'medium')} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-2 min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg leading-tight">{request.title}</CardTitle>
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs xs:text-sm">Created: {format(new Date(request.created_at!), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            {request.properties && (
              <p className="text-sm text-gray-600 truncate">{request.properties.title}</p>
            )}
            {userRole === 'landlord' && request.profiles && (
              <p className="text-sm text-gray-600">Tenant: {request.profiles.name || request.profiles.email}</p>
            )}
          </div>
          <div className="flex flex-row xs:flex-col items-start xs:items-end gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {request.priority} Priority
            </Badge>
            {getStatusBadge(request.status || 'pending')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-gray-700 text-sm md:text-base">{request.description}</p>
          
          <div className="flex flex-col xs:flex-row gap-2">
            {userRole === 'landlord' && (
              <Select
                value={request.status || 'pending'}
                onValueChange={(value) => onUpdateStatus(request.id, value, request)}
              >
                <SelectTrigger className="w-full xs:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Button
              onClick={() => onStartChat(request)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full xs:w-auto"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden xs:inline">Chat about this request</span>
              <span className="xs:hidden">Chat</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
