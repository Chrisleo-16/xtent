import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, BanknoteIcon, Building, Verified, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import PropertyCard from '@/components/PropertyCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Properties = () => {
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rentRange, setRentRange] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const { user } = useAuth();

  // Fetch properties with proper error handling and retry
  const { 
    data: properties = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      console.log('Fetching properties...');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name),
          landlord:profiles!properties_landlord_id_fkey (
            id,
            name,
            verification_status
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      console.log('Fetched properties:', data?.length || 0);
      return data || [];
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Filter properties when data or filters change
  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rent range filter
    if (rentRange !== 'all') {
      const [min, max] = rentRange.split('-').map(Number);
      filtered = filtered.filter(property => {
        const rent = property.monthly_rent;
        if (max) {
          return rent >= min && rent <= max;
        } else {
          return rent >= min;
        }
      });
    }

    // Property type filter (based on bedrooms)
    if (propertyType !== 'all') {
      if (propertyType === 'studio') {
        filtered = filtered.filter(property => property.bedrooms === 0);
      } else if (propertyType === '1br') {
        filtered = filtered.filter(property => property.bedrooms === 1);
      } else if (propertyType === '2br') {
        filtered = filtered.filter(property => property.bedrooms === 2);
      } else if (propertyType === '3br+') {
        filtered = filtered.filter(property => property.bedrooms >= 3);
      }
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, rentRange, propertyType]);

  const clearFilters = () => {
    setSearchTerm('');
    setRentRange('all');
    setPropertyType('all');
  };

  const handleRetry = () => {
    toast.info('Retrying...');
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <Building className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Properties
              </h3>
              <p className="text-gray-600 mb-6">
                We're having trouble loading the property listings. Please try again.
              </p>
              <Button onClick={handleRetry} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse verified properties across Kenya. Quality homes, transparent pricing, trusted landlords.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{properties.length}</div>
              <div className="text-green-100">Available Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {properties.filter(p => p.landlord?.verification_status === 'verified').length}
              </div>
              <div className="text-green-100">Verified Landlords</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-green-100">Support Available</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location, title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={rentRange} onValueChange={setRentRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Rent Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-15000">Under KES 15,000</SelectItem>
                  <SelectItem value="15000-30000">KES 15,000 - 30,000</SelectItem>
                  <SelectItem value="30000-50000">KES 30,000 - 50,000</SelectItem>
                  <SelectItem value="50000-100000">KES 50,000 - 100,000</SelectItem>
                  <SelectItem value="100000-999999">Above KES 100,000</SelectItem>
                </SelectContent>
              </Select>

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1br">1 Bedroom</SelectItem>
                  <SelectItem value="2br">2 Bedrooms</SelectItem>
                  <SelectItem value="3br+">3+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProperties.length}</span> of <span className="font-semibold">{properties.length}</span> properties
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Verified className="h-4 w-4 text-green-600" />
            Verified listings only
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Building className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {properties.length === 0 ? 'No properties available yet' : 'No properties match your criteria'}
            </h3>
            <p className="text-gray-600 mb-6">
              {properties.length === 0 
                ? 'Be the first to list your property on XTENT' 
                : 'Try adjusting your search criteria or browse all properties'
              }
            </p>
            {properties.length === 0 && user && (
              <Button className="bg-green-600 hover:bg-green-700">
                List Your Property
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {filteredProperties.map((property) => (
              <PropertyCard 
                key={property.id}
                property={{
                  ...property,
                  isVerified: property.landlord?.verification_status === 'verified'
                }}
              />
            ))}
          </div>
        )}
      </main>

      <MobileNavigation role={user ? "tenant" : "guest"} />
    </div>
  );
};

export default Properties;
