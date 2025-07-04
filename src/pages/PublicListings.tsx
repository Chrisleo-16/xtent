
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, Bed, Bath, Square, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingFallback from '@/components/LoadingFallback';

interface Property {
  id: string;
  title: string;
  address: string;
  monthly_rent: number;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: number | null;
  custom_type: string | null;
  thumbnail_url: string | null;
  images: string[] | null;
  status: string;
  landlord_id: string;
  description: string | null;
  property_amenities: { amenities: { name: string, icon: string } }[] | null;
}

const PublicListings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');

  // Fetch all available properties (status = 'available' means listed)
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['public-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          address,
          monthly_rent,
          bedrooms,
          bathrooms,
          size_sqft,
          custom_type,
          thumbnail_url,
          images,
          status,
          landlord_id,
          property_amenities(
            amenities(name, icon)
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refetch every 30 seconds to keep listings fresh
  });

  // Filter properties based on search criteria
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceRange === 'all' || (() => {
      const rent = property.monthly_rent || 0;
      switch (priceRange) {
        case 'under-30k': return rent < 30000;
        case '30k-50k': return rent >= 30000 && rent <= 50000;
        case '50k-100k': return rent > 50000 && rent <= 100000;
        case 'over-100k': return rent > 100000;
        default: return true;
      }
    })();
    
    const matchesType = propertyType === 'all' || property.custom_type === propertyType;
    
    const matchesBedrooms = bedroomFilter === 'all' || (() => {
      const bedrooms = property.bedrooms || 0;
      switch (bedroomFilter) {
        case '1': return bedrooms === 1;
        case '2': return bedrooms === 2;
        case '3': return bedrooms === 3;
        case '4+': return bedrooms >= 4;
        default: return true;
      }
    })();

    return matchesSearch && matchesPrice && matchesType && matchesBedrooms;
  });

  // Get unique property types for filter
  const propertyTypes = [...new Set(properties.map(p => p.custom_type).filter(Boolean))];

  const handleViewProperty = (propertyId: string) => {
    // For now, navigate to property details - will create tenant view later
    navigate(`/property/${propertyId}`);
  };

  if (isLoading) {
    return <LoadingFallback message="Loading available properties..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500">Failed to load property listings</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Find Your Perfect Home</h1>
        <p className="text-gray-600">
          Browse available properties and find the perfect place to call home
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by location or property name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-30k">Under KES 30,000</SelectItem>
                <SelectItem value="30k-50k">KES 30K - 50K</SelectItem>
                <SelectItem value="50k-100k">KES 50K - 100K</SelectItem>
                <SelectItem value="over-100k">Over KES 100K</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Bedrooms</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4+">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} available
        </p>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or check back later for new listings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg relative overflow-hidden">
                {property.thumbnail_url || (property.images && property.images.length > 0) ? (
                  <img 
                    src={property.thumbnail_url || property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-12 w-12 text-green-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-600">Available</Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-green-800 group-hover:text-green-700 transition-colors">
                  {property.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{property.address}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-green-600">
                    KES {property.monthly_rent?.toLocaleString()}/month
                  </div>
                  {property.custom_type && (
                    <Badge variant="outline" className="text-xs">
                      {property.custom_type}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms || 0}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms || 0}
                    </div>
                    {property.size_sqft && (
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.size_sqft} sqft
                      </div>
                    )}
                  </div>
                </div>

                {property.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {property.description}
                  </p>
                )}

                {/* Amenities Preview */}
                {property.property_amenities && property.property_amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {property.property_amenities.slice(0, 3).map((pa, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {pa.amenities.name}
                      </Badge>
                    ))}
                    {property.property_amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{property.property_amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => handleViewProperty(property.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Property Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicListings;
