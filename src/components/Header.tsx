
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthButtons } from './header/AuthButtons';
import { DesktopNavigation } from './header/DesktopNavigation';
import { TabletNavigation } from './header/TabletNavigation';
import { MobileMenu } from './header/MobileMenu';
import { Button } from './ui/button';
import { Home, Menu } from 'lucide-react';
import { useState } from 'react';
import XtentLogo from './XtentLogo';

const Header = () => {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getUserDashboardPath = () => {
    if (!user) return '/auth';
    const userRole = user.user_metadata?.role || 'tenant';
    return userRole === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard';
  };

  const userRoles = user?.user_metadata?.roles;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <XtentLogo size="sm" showTagline={false} />
          </Link>

          {/* Navigation for different screen sizes */}
          <div className="hidden lg:block">
            <DesktopNavigation />
          </div>
          <div className="hidden md:block lg:hidden">
            <TabletNavigation />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Browse Properties Button - Always visible */}
            <Link to="/properties" className="hidden sm:block">
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                <Home className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>

            {/* Auth buttons */}
            <div className="hidden sm:block">
              <AuthButtons 
                isLoading={isLoading}
                user={user}
                getUserDashboardPath={getUserDashboardPath}
                userRoles={userRoles}
              />
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isLoading={isLoading}
          user={user}
          getUserDashboardPath={getUserDashboardPath}
          userRoles={userRoles}
        />
      </div>
    </header>
  );
};

export default Header;
