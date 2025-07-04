
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Languages, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import AcceptInvitationForm from '@/components/auth/AcceptInvitationForm';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState('en');
  const [emailSent, setEmailSent] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitationToken');

  // Check URL parameters for default tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Simplified auth check
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        console.log('Starting auth check...');
        setIsCheckingAuth(true);
        setAuthError(null);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          setAuthError('Authentication service unavailable');
          setIsCheckingAuth(false);
          return;
        }

        if (session?.user) {
          console.log('User already authenticated:', session.user.id);
          // Brief delay to show the page before redirecting
          setTimeout(() => {
            setIsCheckingAuth(false);
          }, 500);
        } else {
          console.log('No existing session found');
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuthError('Failed to check authentication status');
        setIsCheckingAuth(false);
      }
    };

    checkInitialAuth();
  }, []);

  const redirectUserBasedOnRole = async (userId: string) => {
    try {
      console.log('Redirecting user based on role:', userId);
      
      // First check for admin role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const hasAdminRole = userRoles?.some(r => r.role === 'admin');
      
      if (hasAdminRole) {
        console.log('User has admin role');
        navigate('/admin-dashboard');
        return;
      }

      // Get primary role from profiles with a short timeout
      const { data: profileData, error: profileError } = await Promise.race([
        supabase
          .from('profiles')
          .select('role, verification_status, email')
          .eq('id', userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        )
      ]) as any;

      if (profileError && !profileError.message.includes('timeout')) {
        console.log('Profile not found, creating default profile...');
        
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData.user?.email;
        const userRole = userData.user?.user_metadata?.role || 
                        userData.user?.app_metadata?.role || 'tenant';
        
        if (userEmail) {
          await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                role: userRole,
                email: userEmail,
                name: userData.user?.user_metadata?.name || 
                      userData.user?.user_metadata?.full_name,
                phone: userData.user?.user_metadata?.phone,
                verification_status: 'unverified'
              }
            ]);
        }

        // Route based on detected role
        console.log('Redirecting based on user metadata role:', userRole);
        if (userRole === 'landlord') {
          navigate('/landlord-dashboard');
        } else {
          navigate('/tenant-dashboard');
        }
        
        toast({
          title: "Welcome!",
          description: "Profile setup complete. Welcome to XTent!",
        });
        return;
      }

      if (!profileData) {
        console.log('No profile data available, defaulting to tenant');
        navigate('/tenant-dashboard');
        return;
      }

      console.log('User profile found:', profileData);

      // Route based on role
      const role = profileData.role;
      switch (role) {
        case 'landlord':
          console.log('Redirecting to landlord dashboard');
          navigate('/landlord-dashboard');
          break;
        case 'tenant':
          console.log('Redirecting to tenant dashboard');
          navigate('/tenant-dashboard');
          break;
        case 'caretaker':
          navigate('/caretaker-dashboard');
          break;
        case 'vendor':
          navigate('/vendor-dashboard');
          break;
        default:
          console.log('Unknown or missing role, defaulting to tenant dashboard');
          navigate('/tenant-dashboard');
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      console.error('Error in redirect:', error);
      // Default to tenant dashboard on any error
      navigate('/tenant-dashboard');
      toast({
        title: "Welcome!",
        description: "Logged in successfully.",
      });
    }
  };

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Sign-up form state  
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as 'landlord' | 'tenant' | 'caretaker' | 'vendor',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    console.log('Attempting login for:', loginData.email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'An error occurred during login.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before logging in.';
        } else {
          errorMessage = error.message;
        }
        
        setAuthError(errorMessage);
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('Login successful:', data.user?.id);
      
      if (data.user) {
        await redirectUserBasedOnRole(data.user.id);
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setAuthError(errorMsg);
      toast({
        title: "Login Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    console.log('Attempting signup for:', signUpData.email, 'with role:', signUpData.role);

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      const errorMsg = "Passwords do not match.";
      setAuthError(errorMsg);
      toast({
        title: "Password Mismatch",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long.";
      setAuthError(errorMsg);
      toast({
        title: "Weak Password",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
            full_name: signUpData.name,
            phone: signUpData.phone,
            role: signUpData.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'An error occurred during sign up.';
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else {
          errorMessage = error.message;
        }
        
        setAuthError(errorMessage);
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('Signup response:', data);

      if (data.user && !data.session) {
        // Email confirmation required
        setEmailSent(true);
        setAuthError(null);
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email and click the confirmation link to activate your account.",
        });

        // Clear the form
        setSignUpData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'tenant',
        });
      } else if (data.session && data.user) {
        // User is automatically signed in
        console.log('User automatically signed in after signup');
        
        // Create profile immediately
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              email: signUpData.email,
              role: signUpData.role,
              name: signUpData.name,
              phone: signUpData.phone,
              verification_status: 'unverified'
            }
          ], { onConflict: 'id' });

        if (profileError) {
          console.error('Error upserting profile during signup:', profileError);
        }

        toast({
          title: "Account Created Successfully!",
          description: "Welcome to XTent! Your account has been created.",
        });

        await redirectUserBasedOnRole(data.user.id);
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setAuthError(errorMsg);
      toast({
        title: "Sign Up Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryAuth = () => {
    console.log('Retrying auth check...');
    setAuthError(null);
    window.location.reload();
  };

  const texts = {
    en: {
      login: 'Login',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      phone: 'Phone Number',
      role: 'Role',
      loginButton: 'Login',
      signUpButton: 'Create Account',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      selectRole: 'Select your role',
      landlord: 'Landlord',
      tenant: 'Tenant',
      caretaker: 'Caretaker',
      vendor: 'Vendor',
      welcome: 'Welcome to XTent',
      subtitle: 'Your gateway to the best of living',
      emailSentTitle: 'Check Your Email',
      emailSentDesc: 'We\'ve sent a confirmation link to your email address. Please click the link to activate your account.',
      checkingAuth: 'Checking authentication...',
    },
    sw: {
      login: 'Ingia',
      signUp: 'Jisajili',
      email: 'Barua pepe',
      password: 'Nywila',
      confirmPassword: 'Thibitisha Nywila',
      name: 'Jina Kamili',
      phone: 'Nambari ya Simu',
      role: 'Wadhifa',
      loginButton: 'Ingia',
      signUpButton: 'Unda Akaunti',
      showPassword: 'Onyesha nywila',
      hidePassword: 'Ficha nywila',
      selectRole: 'Chagua wadhifa yako',
      landlord: 'Mwenye Nyumba',
      tenant: 'Mpangaji',
      caretaker: 'Mtunzaji',
      vendor: 'Muuzaji',
      welcome: 'Karibu XTent',
      subtitle: 'Lango lako la maisha bora',
      emailSentTitle: 'Angalia Barua Pepe Yako',
      emailSentDesc: 'Tumetuma kiungo cha kuthibitisha kwenye anwani yako ya barua pepe. Tafadhali bonyeza kiungo ili kuamilisha akaunti yako.',
      checkingAuth: 'Tunakagua utambulisho...',
    },
  };

  const t = texts[language as keyof typeof texts];

  // Simplified loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {t.checkingAuth}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                {authError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleRetryAuth}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If there's an invitation token, show the acceptance form
  if (invitationToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <AcceptInvitationForm token={invitationToken} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              {language === 'en' ? 'Kiswahili' : 'English'}
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {t.welcome}
              </CardTitle>
              <p className="text-gray-600">{t.subtitle}</p>
            </CardHeader>
            <CardContent>
              {/* Error display */}
              {authError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {emailSent && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>{t.emailSentTitle}</strong><br />
                    {t.emailSentDesc}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t.login}</TabsTrigger>
                  <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t.email}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        disabled={isLoading}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t.password}</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          placeholder="Enter your password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? t.hidePassword : t.showPassword}
                          </span>
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : t.loginButton}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t.name}</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        required
                        disabled={isLoading}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t.email}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        disabled={isLoading}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">{t.phone}</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        required
                        disabled={isLoading}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-role">{t.role}</Label>
                      <Select
                        value={signUpData.role}
                        onValueChange={(value: 'landlord' | 'tenant' | 'caretaker' | 'vendor') =>
                          setSignUpData({ ...signUpData, role: value })
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectRole} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landlord">{t.landlord}</SelectItem>
                          <SelectItem value="tenant">{t.tenant}</SelectItem>
                          <SelectItem value="caretaker">{t.caretaker}</SelectItem>
                          <SelectItem value="vendor">{t.vendor}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t.password}</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          minLength={6}
                          placeholder="Enter password (min 6 characters)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? t.hidePassword : t.showPassword}
                          </span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">{t.confirmPassword}</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          required
                          disabled={isLoading}
                          minLength={6}
                          placeholder="Confirm your password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? t.hidePassword : t.showPassword}
                          </span>
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : t.signUpButton}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
