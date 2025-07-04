
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Home, Search, Filter, Plus, MapPin, Bed, Bath, Square } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PropertyListingBadge } from '@/components/properties/PropertyListingBadge';
import LoadingFallback from '@/components/LoadingFallback';

const LandlordProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['landlordProperties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(url, is_thumbnail, display_order)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Filter properties based on search and filter criteria
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || property.custom_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique property types for filter
  const propertyTypes = [...new Set(properties.map(p => p.custom_type).filter(Boolean))];

  const handleListingChange = (propertyId: string, isListed: boolean) => {
    // Optional: Handle any additional UI updates if needed
    console.log(`Property ${propertyId} listing status changed to: ${isListed}`);
  };

  if (isLoading) {
    return <LoadingFallback message="Loading your properties..." />;
  }

  if (error) {
    return (
      <ResponsiveSidebarLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500">Error loading properties</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveSidebarLayout>
    );
  }

  return (
    <ResponsiveSidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-800">My Properties</h1>
            <p className="text-gray-600">
              Manage and monitor your property portfolio
            </p>
          </div>
          <Button 
            onClick={() => navigate('/add-property')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredProperties.length} of {properties.length} properties
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Use filters to refine results</span>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {properties.length === 0 ? 'No Properties Yet' : 'No Properties Match Your Filters'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {properties.length === 0 
                    ? 'Start building your property portfolio by adding your first property.'
                    : 'Try adjusting your search criteria or filters to find properties.'
                  }
                </p>
                {properties.length === 0 && (
                  <Button 
                    onClick={() => navigate('/add-property')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow group">
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
                  
                  {/* Status and Listing Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    <Badge 
                      variant={property.status === 'available' ? 'default' : property.status === 'occupied' ? 'secondary' : 'destructive'}
                      className="capitalize"
                    >
                      {property.status}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <PropertyListingBadge 
                      propertyId={property.id}
                      isListed={property.status === 'available'}
                      onListingChange={(isListed) => handleListingChange(property.id, isListed)}
                    />
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-green-800 group-hover:text-green-700 transition-colors line-clamp-1">
                      {property.title}
                    </CardTitle>
                  </div>
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

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => navigate(`/manage-property/${property.id}`)}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ResponsiveSidebarLayout>
  );
};

export default LandlordProperties;
