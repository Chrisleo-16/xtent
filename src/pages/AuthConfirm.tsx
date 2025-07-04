
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const AuthConfirm = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const redirectUserBasedOnRole = async (userId: string) => {
    try {
      console.log('Checking user profile for post-confirmation redirect:', userId);
      
      // Check if user has admin role first
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const hasAdminRole = userRoles?.some(r => r.role === 'admin');
      
      if (hasAdminRole) {
        console.log('User has admin role, redirecting to admin dashboard');
        navigate('/admin-dashboard');
        return;
      }

      // Get primary role from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, verification_status, email')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        
        // If profile doesn't exist, create a default one
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData.user?.email;
        
        if (userEmail) {
          const { error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                role: 'tenant',
                email: userEmail,
                verification_status: 'unverified'
              }
            ]);

          if (createError) {
            console.error('Error creating default profile:', createError);
          }
        }
        
        navigate('/tenant-dashboard');
        return;
      }

      if (!profileData) {
        console.log('No profile found, creating default profile...');
        
        // Get user email for profile creation
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData.user?.email;
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              role: 'tenant',
              email: userEmail,
              verification_status: 'unverified'
            }
          ]);

        if (createError) {
          console.error('Error creating default profile:', createError);
        }

        navigate('/tenant-dashboard');
        return;
      }

      console.log('User profile found:', profileData);

      // Redirect based on role
      const role = profileData.role;
      switch (role) {
        case 'landlord':
          navigate('/landlord-dashboard');
          break;
        case 'tenant':
          navigate('/tenant-dashboard');
          break;
        case 'caretaker':
          navigate('/caretaker-dashboard');
          break;
        case 'vendor':
          navigate('/vendor-dashboard');
          break;
        default:
          console.log('Unknown role, defaulting to tenant dashboard');
          navigate('/tenant-dashboard');
      }

      toast({
        title: "Welcome to XTent!",
        description: "Your account has been confirmed and you are now logged in.",
      });
    } catch (error) {
      console.error('Error in post-confirmation redirect:', error);
      navigate('/tenant-dashboard');
      toast({
        title: "Welcome to XTent!",
        description: "Your account has been confirmed and you are now logged in.",
      });
    }
  };

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      try {
        console.log('Starting auth confirmation process...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session after confirmation:', error);
          setError('There was an issue confirming your account. Please try logging in.');
          toast({
            title: "Confirmation Error",
            description: "There was an issue confirming your account. Please try logging in.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (data.session && data.session.user) {
          console.log('User confirmed and session active:', data.session.user.id);
          await redirectUserBasedOnRole(data.session.user.id);
        } else {
          console.log('No active session found, redirecting to auth');
          setError('Please log in to access your account.');
          toast({
            title: "Please Log In",
            description: "Please log in to access your account.",
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (error) {
        console.error('Unexpected error during auth confirmation:', error);
        setError('There was an unexpected error. Please try logging in.');
        toast({
          title: "Confirmation Error",
          description: "There was an unexpected error. Please try logging in.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    const timer = setTimeout(() => {
      handleAuthConfirmation();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                {error ? "Authentication Error" : (isProcessing ? "Confirming Your Account..." : "Redirecting...")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {!error && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              )}
              <p className="text-gray-600">
                {error || "Please wait while we confirm your account and log you in automatically."}
              </p>
              {error && (
                <p className="text-sm text-gray-500 mt-2">
                  You will be redirected to the login page in a few seconds.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthConfirm;
