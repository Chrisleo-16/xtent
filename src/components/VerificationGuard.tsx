
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingFallback from './LoadingFallback';

interface VerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
  allowedPages?: string[];
}

const VerificationGuard = ({ 
  children, 
  requireVerification = true,
  allowedPages = ['/settings', '/verification', '/auth']
}: VerificationGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user || !requireVerification) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching verification status:', error);
          setVerificationStatus('unverified');
        } else {
          setVerificationStatus(profile?.verification_status || 'unverified');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        setVerificationStatus('unverified');
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [user, requireVerification]);

  if (isLoading) {
    return <LoadingFallback message="Checking verification status..." />;
  }

  // Don't show verification guard if not required or user is not logged in
  if (!requireVerification || !user) {
    return <>{children}</>;
  }

  // Check if current page is in allowed pages
  const currentPath = window.location.pathname;
  const isAllowedPage = allowedPages.some(page => currentPath.startsWith(page));

  // If user is verified or on an allowed page, show children
  if (verificationStatus === 'verified' || isAllowedPage) {
    return <>{children}</>;
  }

  const handleVerifyAccount = () => {
    navigate('/verification');
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return {
          title: 'Verification Under Review',
          message: 'Your documents are being reviewed. You will be notified once verification is complete.',
          color: 'border-blue-200 bg-blue-50',
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />
        };
      case 'rejected':
        return {
          title: 'Verification Required',
          message: 'Your verification was rejected. Please update your documents and try again.',
          color: 'border-red-200 bg-red-50',
          icon: <ShieldAlert className="h-5 w-5 text-red-500" />
        };
      default:
        return {
          title: 'Account Verification Required',
          message: 'To ensure security and access all features, please verify your account by uploading the required documents.',
          color: 'border-yellow-200 bg-yellow-50',
          icon: <ShieldAlert className="h-5 w-5 text-yellow-500" />
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-800">
            Welcome to XTENT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={`${statusInfo.color} border`}>
            <div className="flex items-start gap-3">
              {statusInfo.icon}
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">{statusInfo.title}</h4>
                <AlertDescription className="text-slate-700">
                  {statusInfo.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Required for full access:</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Add and manage properties
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Invite and manage tenants
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Access billing and payments
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Full communication features
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleVerifyAccount}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Verify My Account
            </Button>
            
            <Button 
              onClick={() => navigate('/settings')}
              variant="outline"
              className="w-full"
            >
              Go to Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationGuard;
