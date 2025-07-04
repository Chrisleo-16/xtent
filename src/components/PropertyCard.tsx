
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, DollarSign, Eye } from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    monthly_rent: number;
    bedrooms?: number;
    bathrooms?: number;
    images?: string[];
    thumbnail_url?: string;
    status: string;
    property_types?: { name: string };
  };
  showViewButton?: boolean;
}

const PropertyCard = ({ property, showViewButton = true }: PropertyCardProps) => {
  const imageUrl = property.thumbnail_url || property.images?.[0] || '/placeholder-property.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-property.jpg';
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge 
              variant={property.status === 'available' ? 'default' : 'secondary'}
              className={property.status === 'available' ? 'bg-green-100 text-green-800' : ''}
            >
              {property.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.address}</span>
        </div>
        
        <div className="flex items-center text-green-600 mb-3">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="font-semibold">KES {property.monthly_rent?.toLocaleString()}/month</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {property.property_types?.name && (
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>{property.property_types.name}</span>
            </div>
          )}
          
          {property.bedrooms && (
            <span>{property.bedrooms} bed</span>
          )}
          
          {property.bathrooms && (
            <span>{property.bathrooms} bath</span>
          )}
        </div>
      </CardContent>
      
      {showViewButton && (
        <CardFooter className="p-4 pt-0">
          <Link to={`/property/${property.id}`} className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default PropertyCard;
