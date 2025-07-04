
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreativeActionButton } from '@/components/ui/creative-action-button';
import { CreditCard, Wrench, Mail, Receipt, Home, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const { toast } = useToast();

  const handlePayRent = () => {
    toast({
      title: "Payment Portal",
      description: "Redirecting to payment portal...",
    });
    // Navigate to pay rent functionality
  };

  const handleSubmitMaintenance = () => {
    toast({
      title: "Maintenance Request",
      description: "Opening maintenance request form...",
    });
    // Navigate to maintenance form
  };

  const handleContactLandlord = () => {
    toast({
      title: "Contact Landlord",
      description: "Opening communication channel...",
    });
    // Navigate to communication/chat
  };

  const handlePaymentHistory = () => {
    toast({
      title: "Payment History",
      description: "Loading your payment records...",
    });
    // Navigate to payment history
  };

  const handleLeaseDetails = () => {
    toast({
      title: "Lease Details",
      description: "Opening lease information...",
    });
    // Navigate to lease details
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Update",
      description: "Opening profile settings...",
    });
    // Navigate to profile settings
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button onClick={handlePayRent}>
            <CreativeActionButton icon={CreditCard} label="Pay Rent" variant="orange" />
          </button>
          <button onClick={handleSubmitMaintenance}>
            <CreativeActionButton icon={Wrench} label="Submit Maintenance" variant="red" />
          </button>
          <button onClick={handleContactLandlord}>
            <CreativeActionButton icon={Mail} label="Contact Landlord" variant="purple" />
          </button>
          <button onClick={handlePaymentHistory}>
            <CreativeActionButton icon={Receipt} label="Payment History" variant="orange" />
          </button>
          <button onClick={handleLeaseDetails}>
            <CreativeActionButton icon={Home} label="Lease Details" variant="green" />
          </button>
          <button onClick={handleUpdateProfile}>
            <CreativeActionButton icon={User} label="Update Profile" variant="gray" />
          </button>
          <Link to="/verify-account" className="col-span-2 sm:col-span-1">
            <CreativeActionButton icon={ShieldCheck} label="Verify Account" variant="blue" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
