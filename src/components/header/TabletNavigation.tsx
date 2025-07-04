
import { Link } from 'react-router-dom';

export const TabletNavigation = () => {
  return (
    <nav className="flex items-center space-x-3">
      <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        Home
      </Link>
      <Link to="/properties" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        Rentals
      </Link>
      <Link to="/services" className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
        Services
      </Link>
    </nav>
  );
};
