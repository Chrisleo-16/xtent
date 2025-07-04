import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useRecentMaintenanceRequests, MaintenanceRequestWithDetails } from '@/hooks/useRecentMaintenanceRequests';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadge = (status: string) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800', 
    'completed': 'bg-green-100 text-green-800'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
};

const getPriorityBadge = (priority: string) => {
  const priorityColors = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-orange-100 text-orange-800',
    'low': 'bg-green-100 text-green-800'
  };
  return priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
};

const RequestSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
    <div className="flex-1">
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-9 w-24" />
  </div>
);


const RecentMaintenanceRequests = () => {
  const { data: requests, isLoading, error } = useRecentMaintenanceRequests();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <RequestSkeleton />
          <RequestSkeleton />
          <RequestSkeleton />
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="text-red-600 flex items-center gap-2 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <p>Error loading requests: {error.message}</p>
        </div>
       );
    }

    if (!requests || requests.length === 0) {
      return <p className="text-gray-500 text-center py-4">No recent maintenance requests found.</p>;
    }
    
    return (
        <div className="space-y-3">
          {requests.map((request: MaintenanceRequestWithDetails) => (
            <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h4 className="font-medium">{request.properties?.title || 'N/A'}</h4>
                  <div className="flex gap-2">
                    <Badge className={getStatusBadge(request.status || '')}>
                      {request.status}
                    </Badge>
                    <Badge className={getPriorityBadge(request.priority || '')}>
                      {request.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {request.profiles?.name || 'N/A'} - {request.description}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          ))}
        </div>
    );
  };

  return (
    <Card className="shadow-md mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Recent Maintenance Requests
          </CardTitle>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RecentMaintenanceRequests;
