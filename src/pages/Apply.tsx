
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, Bed, Bath, AlertCircle, CheckCircle } from 'lucide-react';
import { useTenantInvitations } from '@/hooks/useTenantInvitations';
import { useAuth } from '@/hooks/useAuth';
import LoadingFallback from '@/components/LoadingFallback';

const Apply = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { getInvitationByToken, redeemInvitation } = useTenantInvitations();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const code = searchParams.get('code');

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!code) {
        setError('No invitation code provided');
        setLoading(false);
        return;
      }

      try {
        const data = await getInvitationByToken(code);
        
        // Check if invitation is valid
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (expiresAt < now) {
          setError('This invitation has expired');
        } else if (data.status !== 'pending') {
          setError('This invitation has already been used');
        } else {
          setInvitation(data);
        }
      } catch (err) {
        setError('Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [code, getInvitationByToken]);

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return;

    try {
      // Redeem the invitation
      await redeemInvitation.mutateAsync({
        token: code!,
        userId: user.id
      });

      navigate('/tenant-dashboard');
    } catch (error) {
      console.error('Failed to redeem invitation:', error);
    }
  };

  if (loading || authLoading) {
    return <LoadingFallback message="Loading invitation..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Property Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation && (
              <div className="text-center">
                <Home className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">{invitation.properties.title}</h3>
                <p className="text-sm text-gray-600">{invitation.properties.address}</p>
              </div>
            )}
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in or create an account to accept this invitation.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                className="flex-1"
              >
                Log In
              </Button>
              <Button 
                onClick={() => navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    You've been invited to apply for {invitation.properties.title}
                  </h2>
                  <p className="text-gray-600">Accept this invitation to proceed with your application.</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{invitation.properties.address}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {invitation.properties.bedrooms} bed
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {invitation.properties.bathrooms} bath
                  </div>
                  <Badge variant="outline">
                    KES {invitation.properties.monthly_rent?.toLocaleString()}/month
                  </Badge>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={handleAcceptInvitation}
                  disabled={redeemInvitation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {redeemInvitation.isPending ? 'Accepting...' : 'Accept Invitation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <LoadingFallback message="Setting up application..." />;
};

export default Apply;
