import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, MessageCircle, FileText, ArrowLeft, Home } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { toast } from 'sonner';
import PropertyImageCarousel from './PropertyImageCarousel';
import LoadingFallback from '@/components/LoadingFallback';

const TenantPropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrGetThread } = useChat();

  // Fetch property with simplified query to avoid type issues
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['tenant-property-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID is required');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_landlord_id_fkey(name, email, phone)
        `)
        .eq('id', id)
        .eq('status', 'available')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch property images
  const { data: propertyImages = [] } = useQuery({
    queryKey: ['tenant-property-images', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch unit information
  const { data: units = [] } = useQuery({
    queryKey: ['property-units', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('property_id', id)
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleContactLandlord = async () => {
    if (!user || !property) {
      toast.error('Please sign in to contact the landlord');
      navigate('/auth');
      return;
    }

    try {
      const thread = await createOrGetThread.mutateAsync({
        propertyId: property.id,
        landlordId: property.landlord_id,
        tenantId: user.id,
        subject: `Inquiry about ${property.title}`
      });

      navigate('/tenant-chat');
      toast.success('Chat thread created successfully');
    } catch (error) {
      console.error('Failed to create chat thread:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleApply = () => {
    if (!user) {
      toast.error('Please sign in to apply');
      navigate('/auth');
      return;
    }
    navigate(`/property-application/${id}`);
  };

  if (isLoading) return <LoadingFallback message="Loading property details..." />;
  
  if (error || !property) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500">Property not found or no longer available</p>
              <Button onClick={() => navigate('/listings')} className="mt-4">
                Back to Listings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalUnits = units.length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const unitTypes = [...new Set(units.map(u => `${u.bedrooms}BR/${u.bathrooms}BA`))];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/listings')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Listings
      </Button>

      {/* Property Images */}
      <PropertyImageCarousel 
        images={propertyImages} 
        propertyTitle={property.title}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-green-800 mb-2">
                    {property.title}
                  </CardTitle>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address}</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    KES {property.monthly_rent?.toLocaleString()}/month
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{property.bedrooms || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Bath className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{property.bathrooms || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                </div>
                {property.size_sqft && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Square className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{property.size_sqft}</span>
                    </div>
                    <p className="text-sm text-gray-500">Sq Ft</p>
                  </div>
                )}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{vacantUnits}/{totalUnits}</span>
                  </div>
                  <p className="text-sm text-gray-500">Available</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Unit Types */}
          {units.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unitTypes.map(type => {
                    const typeUnits = units.filter(u => `${u.bedrooms}BR/${u.bathrooms}BA` === type);
                    const availableUnits = typeUnits.filter(u => u.status === 'vacant');
                    const rentRange = typeUnits.length > 0 ? typeUnits.map(u => u.monthly_rent || u.rent_amount || property.monthly_rent).filter(Boolean) : [];
                    const minRent = Math.min(...rentRange);
                    const maxRent = Math.max(...rentRange);

                    return (
                      <div key={type} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{type}</h4>
                          <p className="text-sm text-gray-500">
                            {availableUnits.length} of {typeUnits.length} available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            KES {minRent === maxRent ? minRent.toLocaleString() : `${minRent.toLocaleString()} - ${maxRent.toLocaleString()}`}
                          </p>
                          <p className="text-xs text-gray-500">per month</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Landlord</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{property.profiles?.name || 'Property Owner'}</p>
                <p className="text-sm text-gray-600">{property.profiles?.email}</p>
                {property.profiles?.phone && (
                  <p className="text-sm text-gray-600">{property.profiles.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleContactLandlord}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={createOrGetThread.isPending}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {createOrGetThread.isPending ? 'Starting Chat...' : 'Send Message'}
                </Button>
                
                <Button 
                  onClick={handleApply}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Property Type */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Property Type</span>
                <span className="font-medium">{property.custom_type || 'Residential'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Units</span>
                <span className="font-medium">{totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Units</span>
                <span className="font-medium text-green-600">{vacantUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {property.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantPropertyDetailPage;
