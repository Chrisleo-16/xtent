
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandlordPropertyCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    monthly_rent: number;
    bedrooms?: number;
    bathrooms?: number;
    size_sqft?: number;
    status: string;
    thumbnail_url?: string;
    description?: string;
  };
}

const LandlordPropertyCard = ({ property }: LandlordPropertyCardProps) => {
  const getPropertyImage = () => {
    if (property.thumbnail_url) {
      return property.thumbnail_url;
    }
    return `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop&crop=center`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md">
      <CardHeader className="p-0">
        <div className="relative">
          <Link to={`/property/${property.id}`}>
            <img
              src={getPropertyImage()}
              alt={property.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop&crop=center`;
              }}
            />
          </Link>
          
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(property.status)}>
              {property.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg">
            <span className="font-bold text-lg">KES {property.monthly_rent?.toLocaleString()}</span>
            <span className="text-sm opacity-90">/month</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Link to={`/property/${property.id}`} className="block group-hover:text-green-600 transition-colors">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
        </Link>
        
        <div className="flex items-start gap-2 text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm line-clamp-2">{property.address}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-blue-600" />
              <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-blue-600" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {property.size_sqft && (
            <div className="flex items-center gap-2 col-span-2">
              <Square className="h-4 w-4 text-purple-600" />
              <span>{property.size_sqft} sqft</span>
            </div>
          )}
        </div>

        {property.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {property.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LandlordPropertyCard;
