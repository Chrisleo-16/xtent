import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useMountedState } from './useMountedState';
import { useToast } from '@/hooks/use-toast';

export const useRoleBasedRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useMountedState();
  const { toast } = useToast();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Use centralized role management
  const { role: userRole, isLoading: roleLoading, error: roleError, refetch: refetchRole } = useUserRole();

  const redirectToRoleDashboard = (role: string) => {
    if (!mountedRef.current || hasRedirected) return;
    
    // Don't redirect if user is already on a valid page for their role
    const currentPath = location.pathname;
    const validPaths = getValidPathsForRole(role);
    
    if (validPaths.some(path => currentPath.startsWith(path))) {
      return;
    }
    
    setHasRedirected(true);
    
    try {
      // Secure role-based routing
      switch (role.toLowerCase()) {
        case 'landlord':
          console.log('Redirecting landlord to landlord dashboard');
          navigate('/landlord-dashboard', { replace: true });
          break;
        case 'tenant':
          console.log('Redirecting tenant to tenant dashboard');
          navigate('/tenant-dashboard', { replace: true });
          break;
        case 'admin':
          console.log('Redirecting admin to admin dashboard');
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'caretaker':
          console.log('Redirecting caretaker to caretaker dashboard');
          navigate('/caretaker-dashboard', { replace: true });
          break;
        case 'vendor':
          console.log('Redirecting vendor to vendor dashboard');
          navigate('/vendor-dashboard', { replace: true });
          break;
        default:
          console.warn(Unknown role: ${role}, defaulting to tenant dashboard);
          navigate('/tenant-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error during role-based redirect:', error);
      toast({
        title: "Navigation Error",
        description: "There was an issue redirecting you. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const getValidPathsForRole = (role: string) => {
    const basePaths = ['/settings', '/chat', '/verification'];
    
    switch (role.toLowerCase()) {
      case 'landlord':
        return [
          '/landlord-dashboard',
          '/add-property',
          '/properties',
          '/landlord-properties',
          '/manage-property',
          '/property-details',
          '/tenants',
          '/landlord-applications',
          '/maintenance',
          '/maintenance-requests',
          '/billing',
          '/utilities',
          '/tools',
          ...basePaths
        ];
      case 'tenant':
        return [
          '/tenant-dashboard',
          '/enhanced-tenant-dashboard',
          '/tenant-applications',
          '/apply',
          '/maintenance',
          '/tenant-bills',
          '/listings',
          '/property',
          ...basePaths
        ];
      case 'admin':
        return [
          '/admin-dashboard',
          '/landlord-dashboard',
          '/add-property',
          '/properties',
          '/landlord-properties',
          '/manage-property',
          '/property-details',
          '/tenants',
          '/landlord-applications',
          '/maintenance',
          '/maintenance-requests',
          '/billing',
          '/utilities',
          '/tools',
          ...basePaths
        ];
      case 'caretaker':
        return [
          '/caretaker-dashboard',
          '/maintenance',
          '/maintenance-requests',
          '/properties',
          ...basePaths
        ];
      case 'vendor':
        return [
          '/vendor-dashboard',
          '/orders',
          ...basePaths
        ];
      default:
        return basePaths;
    }
  };

  // Main redirect effect - wait for role to be loaded, then redirect
  useEffect(() => {
    if (!user?.id || hasRedirected || roleLoading) return;

    // Only redirect if we have a valid role
    if (userRole) {
      console.log('User role detected:', userRole, 'for user:', user.id);
      redirectToRoleDashboard(userRole);
    }
  }, [user?.id, userRole, roleLoading, hasRedirected, mountedRef]);

  // Timeout with fallback - now uses only database role for security
  useEffect(() => {
    if (!user?.id || hasRedirected) return;

    const timeout = setTimeout(() => {
      if (mountedRef.current && roleLoading && !hasRedirected) {
        console.warn('Role-based redirect timeout - using fallback');
        
        // Use only database role or default to tenant for security
        const fallbackRole = userRole || 'tenant';
        
        toast({
          title: "Loading Timeout",
          description: "Using fallback navigation due to slow connection.",
        });
        
        redirectToRoleDashboard(fallbackRole);
      }
    }, 8000); // Reduced timeout

    return () => clearTimeout(timeout);
  }, [user?.id, roleLoading, hasRedirected, mountedRef, toast, userRole]);

  // Retry mechanism for failed queries
  const retryQueries = () => {
    if (roleError) refetchRole();
  };

  return {
    userRole,
    redirectToRoleDashboard,
    isLoading: roleLoading,
    error: roleError,
    retryQueries,
  };
};
