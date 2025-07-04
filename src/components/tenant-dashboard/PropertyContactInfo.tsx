
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, User, Phone, Mail, MessageCircle } from 'lucide-react';
import { OptimizedLease, OptimizedLandlord } from '@/hooks/useOptimizedTenantDashboard';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PropertyContactInfoProps {
  lease: OptimizedLease;
  landlord: OptimizedLandlord;
}

const PropertyContactInfo = ({ lease, landlord }: PropertyContactInfoProps) => {
  const { toast } = useToast();
  const property = lease.property;

  const handleCall = () => {
    if (landlord?.phone) {
      window.open(`tel:${landlord.phone}`, '_self');
    } else {
      toast({
        title: "Phone Number",
        description: "Landlord's phone number not available",
        variant: "destructive"
      });
    }
  };

  const handleEmail = () => {
    if (landlord?.email) {
      window.open(`mailto:${landlord.email}`, '_self');
    } else {
      toast({
        title: "Email Address",
        description: "Landlord's email address not available",
        variant: "destructive"
      });
    }
  };

  const handleMessage = () => {
    toast({
      title: "Message",
      description: "Opening messaging interface...",
    });
    // Navigate to messaging/chat interface
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/20 hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            Your Premium Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-gray-600 mb-1">Property</p>
              <p className="text-lg font-bold text-gray-900">{property?.title || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
              <p className="text-lg font-bold text-gray-900">{property?.address || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-600">Lease Start</p>
                <p className="text-sm font-bold text-gray-900">{format(new Date(lease.start_date), 'MMM dd, yyyy')}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-600">Lease End</p>
                <p className="text-sm font-bold text-gray-900">{format(new Date(lease.end_date), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/20 hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {landlord && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Landlord</p>
                    <p className="text-lg font-bold text-gray-900">{landlord.name || 'N/A'}</p>
                    {landlord.email && (
                      <p className="text-xs text-gray-500 mt-1">{landlord.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCall}
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                      title="Call Landlord"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={handleEmail}
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                      title="Email Landlord"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={handleMessage}
                      size="sm" 
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2"
                      title="Message Landlord"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div>
                <p className="text-sm font-medium text-gray-600">Caretaker</p>
                <p className="text-lg font-bold text-gray-400">Not Assigned</p>
                <p className="text-xs text-gray-500">Contact landlord for assistance.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyContactInfo;
