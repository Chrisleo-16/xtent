
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Building, Users, Home, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import PropertyImageCarousel from './PropertyImageCarousel';
import PropertyMapPreview from './PropertyMapPreview';
import ComprehensiveApplicationForm from './ComprehensiveApplicationForm';
import LoadingFallback from '@/components/LoadingFallback';
import { toast } from 'sonner';

const EnhancedPropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Fetch property details
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID is required');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name),
          landlord:profiles!properties_landlord_id_fkey(name, email, phone),
          property_amenities(
            amenities(id, name, icon, category)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch property images
  const { data: propertyImages = [] } = useQuery({
    queryKey: ['property-images', id],
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

  // Fetch unit statistics
  const { data: unitStats } = useQuery({
    queryKey: ['unit-stats', id],
    queryFn: async () => {
      if (!id) return { total: 0, vacant: 0, occupied: 0, vacantUnits: [] };
      
      const { data, error } = await supabase
        .from('units')
        .select('id, unit_number, status, monthly_rent, unit_types(name)')
        .eq('property_id', id);
      
      if (error) throw error;
      
      const total = data.length;
      const vacant = data.filter(unit => unit.status === 'vacant').length;
      const occupied = data.filter(unit => unit.status === 'occupied').length;
      const vacantUnits = data.filter(unit => unit.status === 'vacant');
      
      return { total, vacant, occupied, vacantUnits };
    },
    enabled: !!id,
  });

  // Check existing application
  const { data: existingApplication } = useQuery({
    queryKey: ['user-application', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('property_id', id)
        .eq('applicant_email', user.email)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!id,
  });

  const handleApplyNow = () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/property/${id}`)}`);
      return;
    }
    
    if (role !== 'tenant') {
      toast.error('Only tenants can apply for properties');
      return;
    }
    
    if (existingApplication) {
      toast.info(`You have already applied. Status: ${existingApplication.status}`);
      return;
    }
    
    setShowApplicationForm(true);
  };

  const handleContactLandlord = () => {
    if (property?.landlord?.email) {
      window.location.href = `mailto:${property.landlord.email}?subject=Inquiry about ${property.title}`;
    } else {
      toast.error('Landlord contact information not available');
    }
  };

  if (isLoading) return <LoadingFallback message="Loading property details..." />;
  
  if (error || !property) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">Failed to load property details</p>
            <Button onClick={() => navigate('/listings')} className="mt-4">
              Back to Listings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rentRange = unitStats?.vacantUnits.length > 0 
    ? (() => {
        const rents = unitStats.vacantUnits.map(unit => unit.monthly_rent).filter(Boolean);
        if (rents.length === 0) return `KES ${property.monthly_rent?.toLocaleString()}`;
        const min = Math.min(...rents);
        const max = Math.max(...rents);
        return min === max ? `KES ${min.toLocaleString()}` : `KES ${min.toLocaleString()} - ${max.toLocaleString()}`;
      })()
    : `KES ${property.monthly_rent?.toLocaleString()}`;

  const amenities = property.property_amenities?.map(pa => pa.amenities).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative">
        <PropertyImageCarousel 
          images={propertyImages} 
          propertyTitle={property.title}
        />
        
        {/* Sticky Action Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-green-800">{property.title}</h1>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleContactLandlord}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Landlord
                </Button>
                
                {role === 'tenant' && !existingApplication && (
                  <Button
                    onClick={handleApplyNow}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    Apply Now
                  </Button>
                )}
                
                {existingApplication && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Applied • {existingApplication.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rent Range</p>
                <p className="text-2xl font-bold text-green-600">{rentRange}</p>
                <p className="text-xs text-gray-500">/month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vacancy</p>
                <p className="text-2xl font-bold text-blue-600">
                  {unitStats?.vacant}/{unitStats?.total}
                </p>
                <p className="text-xs text-gray-500">units vacant</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-orange-600">{unitStats?.total}</p>
                <p className="text-xs text-gray-500">available</p>
              </div>
              <Home className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-purple-600">{unitStats?.occupied}</p>
                <p className="text-xs text-gray-500">units</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Details */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              {property.property_types?.name || 'Property'}
            </Badge>
            <Badge 
              variant={property.status === 'available' ? 'default' : 'secondary'}
              className={property.status === 'available' ? 'bg-green-100 text-green-800' : ''}
            >
              {property.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Map Preview */}
          {property.latitude && property.longitude && (
            <PropertyMapPreview 
              latitude={property.latitude}
              longitude={property.longitude}
              address={property.address}
            />
          )}

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {amenity.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Form */}
      {showApplicationForm && (
        <ComprehensiveApplicationForm
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
            toast.success('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default EnhancedPropertyDetailsPage;
