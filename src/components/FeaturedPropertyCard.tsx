
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Eye, Star } from 'lucide-react';

interface FeaturedPropertyCardProps {
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
    landlord?: {
      verification_status: string;
    };
  };
}

const FeaturedPropertyCard = ({ property }: FeaturedPropertyCardProps) => {
  const imageUrl = property.thumbnail_url || property.images?.[0] || 
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop';

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-green-100">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop';
            }}
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600 text-white border-0">
              Featured
            </Badge>
          </div>
          {property.landlord?.verification_status === 'verified' && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.address}</span>
        </div>
        
        <div className="flex items-center text-green-600 mb-3">
          <span className="font-bold text-lg">KES {property.monthly_rent?.toLocaleString()}</span>
          <span className="text-sm text-gray-500 ml-1">/month</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {property.property_types?.name && (
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>{property.property_types.name}</span>
            </div>
          )}
          
          {property.bedrooms !== undefined && (
            <span>{property.bedrooms} bed</span>
          )}
          
          {property.bathrooms !== undefined && (
            <span>{property.bathrooms} bath</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link to={`/property/${property.id}`} className="w-full">
          <Button className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default FeaturedPropertyCard;
