
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingFallback from '@/components/LoadingFallback';
import VerificationGuard from '@/components/VerificationGuard';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  requireVerification?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireVerification = false }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { role: userRole, isLoading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return <LoadingFallback message="Checking authentication..." />;
  }

  if (!user) {
    // Store the intended destination for redirect after login
    const redirectPath = location.pathname + location.search;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  // Use centralized role system - no fallbacks for security
  const currentRole = userRole || 'tenant';

  // Check if user has permission to access this route
  if (!allowedRoles.includes(currentRole)) {
    // Redirect based on actual user role to prevent security breaches
    let redirectPath = '/';
    
    switch (currentRole.toLowerCase()) {
      case 'landlord':
        redirectPath = '/landlord-dashboard';
        break;
      case 'tenant':
        redirectPath = '/tenant-dashboard';
        break;
      case 'admin':
        redirectPath = '/admin-dashboard';
        break;
      case 'caretaker':
        redirectPath = '/caretaker-dashboard';
        break;
      default:
        // Default to tenant dashboard for unknown roles
        redirectPath = '/tenant-dashboard';
    }
    
    console.warn(`Access denied: User role '${currentRole}' not allowed for route requiring: [${allowedRoles.join(', ')}]. Redirecting to: ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // Wrap with verification guard if required
  if (requireVerification) {
    return (
      <VerificationGuard requireVerification={true}>
        {children}
      </VerificationGuard>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
