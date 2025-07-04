
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, Clock, Receipt, Award, Wrench, Zap, Plus } from 'lucide-react';
import { OptimizedPayment, OptimizedMaintenanceRequest } from '@/hooks/useOptimizedTenantDashboard';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface InfoCardsProps {
  nextRentPayment: OptimizedPayment | undefined;
  lastPayment: OptimizedPayment | undefined;
  openMaintenanceRequests: OptimizedMaintenanceRequest[];
}

const InfoCards = ({ nextRentPayment, lastPayment, openMaintenanceRequests }: InfoCardsProps) => {
  const { toast } = useToast();

  const handlePayNow = () => {
    toast({
      title: "Payment Processing",
      description: "Redirecting to secure payment gateway...",
    });
    // Implement payment functionality
  };

  const handleViewReceipt = () => {
    toast({
      title: "Receipt",
      description: "Opening payment receipt...",
    });
    // Implement receipt viewing
  };

  const handleNewRequest = () => {
    toast({
      title: "New Request",
      description: "Opening maintenance request form...",
    });
    // Implement new maintenance request
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-red-50/30 to-red-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Next Rent Due</CardTitle>
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {nextRentPayment ? (
            <>
              <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-1">
                KES {nextRentPayment.amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due: {format(new Date(nextRentPayment.due_date), 'MMM dd, yyyy')}
              </p>
              <Button 
                onClick={handlePayNow}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 w-full shadow-lg border-0 text-white font-semibold" 
                size="sm"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </>
          ) : (
            <p className="text-gray-600 pt-8 text-center">No upcoming rent due.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-green-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Last Payment</CardTitle>
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <Receipt className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {lastPayment && lastPayment.paid_date ? (
            <>
              <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-1">
                KES {lastPayment.amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Paid: {format(new Date(lastPayment.paid_date), 'MMM dd, yyyy')}
              </p>
              <Button 
                onClick={handleViewReceipt}
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50 font-semibold" 
                size="sm"
              >
                <Receipt className="w-4 h-4 mr-2" />
                View Receipt
              </Button>
            </>
          ) : (
            <p className="text-gray-600 pt-8 text-center">No payment history found.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-orange-50/30 to-orange-100/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Open Requests</CardTitle>
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-1">
            {openMaintenanceRequests.length}
          </div>
          <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Active maintenance requests
          </p>
          <Button 
            onClick={handleNewRequest}
            variant="outline" 
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold" 
            size="sm"
          >
            <Plus className="w-3 h-3 mr-2" />
            New Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoCards;
