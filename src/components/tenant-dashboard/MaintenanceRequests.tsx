
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Calendar, Zap, Award, Eye } from 'lucide-react';
import { OptimizedMaintenanceRequest } from '@/hooks/useOptimizedTenantDashboard';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRequestsProps {
  maintenanceRequests: OptimizedMaintenanceRequest[];
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'pending': { color: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white', icon: Clock },
    'in_progress': { color: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white', icon: Zap }, 
    'completed': { color: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white', icon: Award }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;
  
  return (
    <Badge className={`${config.color} px-3 py-1 rounded-full shadow-lg border-0 flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
};

const getPriorityDot = (priority: string) => {
  const colors = {
    'high': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'low': 'bg-green-500'
  };
  return colors[priority as keyof typeof colors] || colors.low;
};

const MaintenanceRequests = ({ maintenanceRequests }: MaintenanceRequestsProps) => {
  const { toast } = useToast();

  const handleNewRequest = () => {
    toast({
      title: "New Maintenance Request",
      description: "Opening maintenance request form...",
    });
    // Navigate to maintenance request form
  };

  const handleViewDetails = (requestId: string) => {
    toast({
      title: "Request Details",
      description: "Loading maintenance request details...",
    });
    // Navigate to specific maintenance request details
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            Recent Maintenance Requests
          </CardTitle>
          <Button 
            onClick={handleNewRequest}
            size="sm" 
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {maintenanceRequests.length > 0 ? (
          <div className="space-y-3">
            {maintenanceRequests.map((request) => (
              <div key={request.id} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-green-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityDot(request.priority || 'low')}`}></div>
                        <h4 className="font-semibold text-gray-900">{request.title}</h4>
                      </div>
                      {getStatusBadge(request.status || 'pending')}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Submitted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleViewDetails(request.id)}
                    variant="outline" 
                    size="sm" 
                    className="border-green-200 text-green-700 hover:bg-green-50 group-hover:shadow-md transition-all duration-300"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recent maintenance requests.</p>
            <Button 
              onClick={handleNewRequest}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceRequests;
