
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

export const DesktopNavigation = () => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center space-x-4">
      <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        {t('common.home', 'Home')}
      </Link>
      <Link to="/properties" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        {t('rental.rentalProperties', 'Rental Properties')}
      </Link>
      <Link to="/services" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        {t('services.title', 'Our Rental Services')}
      </Link>
      <Link to="/about" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        {t('common.about', 'About')}
      </Link>
      <Link to="/contact" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        {t('common.contact', 'Contact')}
      </Link>
    </nav>
  );
};
