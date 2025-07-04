
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  retry: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  retry: () => {},
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Logout Failed",
          description: "Please try again or refresh the page.",
          variant: "destructive",
        });
        throw error;
      }
      
      // Clear all state
      setUser(null);
      setSession(null);
      setError(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        
        console.log(`Auth initialization attempt ${retryCount + 1}`);
        setIsLoading(true);
        setError(null);

        // Set up auth state listener
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            console.log('Auth state changed:', event, session?.user?.id);
            
            try {
              setSession(session);
              setUser(session?.user ?? null);
              
              // Handle profile creation for signed in users
              if (session?.user && event === 'SIGNED_IN') {
                // Use setTimeout to prevent blocking auth state change
                setTimeout(async () => {
                  if (!isMounted) return;
                  
                  try {
                    const { data: profile, error: profileError } = await supabase
                      .from('profiles')
                      .select('id, role')
                      .eq('id', session.user.id)
                      .single();

                    if (!profile && !profileError) {
                      console.log('Creating profile for signed in user');
                      const userRole = session.user.user_metadata?.role || 
                                     session.user.app_metadata?.role || 'tenant';
                      
                      await supabase
                        .from('profiles')
                        .insert([
                          {
                            id: session.user.id,
                            email: session.user.email,
                            role: userRole,
                            name: session.user.user_metadata?.name || 
                                  session.user.user_metadata?.full_name,
                            phone: session.user.user_metadata?.phone,
                            verification_status: 'unverified'
                          }
                        ]);
                    }
                  } catch (error) {
                    console.error('Error handling profile during sign in:', error);
                  }
                }, 0);
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
              if (isMounted) {
                setError('Authentication error occurred');
              }
            }
            
            if (isMounted) {
              setIsLoading(false);
            }
          }
        );

        // Get initial session with simplified timeout
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (isMounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error getting initial session:', error);
          if (isMounted) {
            setError('Failed to load authentication state');
            setIsLoading(false);
          }
        }

      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          setError('Authentication system unavailable');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      isMounted = false;
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [retryCount, toast]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading timeout - forcing loading to false');
        setIsLoading(false);
        setError('Authentication timeout - please refresh the page');
      }
    }, 10000); // Reduced from 15000 to 10000

    return () => clearTimeout(fallbackTimeout);
  }, [isLoading]);

  const value = {
    user,
    session,
    isLoading,
    signOut,
    retry,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
