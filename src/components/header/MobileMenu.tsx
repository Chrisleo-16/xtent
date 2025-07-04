
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '../LanguageSelector';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  user: any;
  getUserDashboardPath: () => string;
  userRoles: string[] | undefined;
}

export const MobileMenu = ({ 
  isOpen, 
  onClose, 
  isLoading, 
  user, 
  getUserDashboardPath, 
  userRoles 
}: MobileMenuProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-30 border-t">
      <div className="px-4 pb-4 pt-2">
        <nav className="flex flex-col space-y-1 mb-4">
          <Link to="/" onClick={onClose} className="text-base text-gray-700 hover:text-green-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-100 font-medium">
            {t('common.home', 'Home')}
          </Link>
          <Link to="/properties" onClick={onClose} className="text-base text-gray-700 hover:text-green-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-100 font-medium">
            {t('rental.rentalProperties', 'Rental Properties')}
          </Link>
          <Link to="/services" onClick={onClose} className="text-base text-gray-700 hover:text-green-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-100 font-medium">
            {t('services.title', 'Our Rental Services')}
          </Link>
          <Link to="/about" onClick={onClose} className="text-base text-gray-700 hover:text-green-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-100 font-medium">
            {t('common.about', 'About')}
          </Link>
          <Link to="/contact" onClick={onClose} className="text-base text-gray-700 hover:text-green-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-100 font-medium">
            {t('common.contact', 'Contact')}
          </Link>
        </nav>
        <div className="border-t pt-4 space-y-3">
          {isLoading ? (
            <div className="w-full h-9 bg-gray-200 animate-pulse rounded-md"></div>
          ) : user ? (
            <Link to={getUserDashboardPath()} onClick={onClose} className="block">
              <Button className="bg-green-600 hover:bg-green-700 w-full" size="sm">
                <User className="h-4 w-4 mr-2" />
                {userRoles?.includes('admin') ? 'Admin Panel' : t('dashboard.dashboard', 'Dashboard')}
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link to="/auth" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full">
                  {t('auth.signIn', 'Login')}
                </Button>
              </Link>
              <Link to="/auth?tab=signup" onClick={onClose}>
                <Button className="bg-green-600 hover:bg-green-700 w-full" size="sm">
                  {t('auth.signUp', 'Sign Up')}
                </Button>
              </Link>
            </div>
          )}
          <div className="pt-2">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
};
