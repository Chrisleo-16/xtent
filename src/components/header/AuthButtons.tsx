
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthButtonsProps {
  isLoading: boolean;
  user: any;
  getUserDashboardPath: () => string;
  userRoles: string[] | undefined;
  size?: 'desktop' | 'tablet';
}

export const AuthButtons = ({ 
  isLoading, 
  user, 
  getUserDashboardPath, 
  userRoles, 
  size = 'desktop' 
}: AuthButtonsProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    const width = size === 'desktop' ? 'w-20' : 'w-16';
    return <div className={`${width} h-8 bg-gray-200 animate-pulse rounded`}></div>;
  }

  if (user) {
    return (
      <Link to={getUserDashboardPath()}>
        <Button className="bg-green-600 hover:bg-green-700" size="sm">
          <User className="h-4 w-4 mr-1" />
          {size === 'desktop' ? (
            <>
              <span className="hidden xl:inline">
                {userRoles?.includes('admin') ? 'Admin Panel' : t('dashboard.dashboard', 'Dashboard')}
              </span>
              <span className="xl:hidden">Panel</span>
            </>
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link to="/auth">
        <Button variant="outline" size="sm" className={size === 'tablet' ? 'text-xs px-2' : 'text-sm'}>
          {size === 'tablet' ? 'Login' : t('auth.signIn', 'Login')}
        </Button>
      </Link>
      <Link to="/auth?tab=signup">
        <Button className="bg-green-600 hover:bg-green-700" size="sm">
          {size === 'tablet' ? (
            <span className="text-xs px-2">Sign Up</span>
          ) : (
            t('auth.signUp', 'Sign Up')
          )}
        </Button>
      </Link>
    </div>
  );
};
