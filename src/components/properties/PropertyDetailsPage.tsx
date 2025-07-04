
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Settings, MapPin, DollarSign, Wrench, Trash2, Building, Users, Home } from 'lucide-react';
import { toast } from 'sonner';
import PropertyEditModal from './PropertyEditModal';
import LoadingFallback from '@/components/LoadingFallback';
import PropertyApplicationButton from '@/components/properties/PropertyApplicationButton';
import PropertyImageCarousel from './PropertyImageCarousel';
import PropertyMapPreview from './PropertyMapPreview';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID is required');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name),
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
      if (!id) return { total: 0, vacant: 0, occupied: 0 };
      
      const { data, error } = await supabase
        .from('units')
        .select('status')
        .eq('property_id', id);
      
      if (error) throw error;
      
      const total = data.length;
      const vacant = data.filter(unit => unit.status === 'vacant').length;
      const occupied = data.filter(unit => unit.status === 'occupied').length;
      
      return { total, vacant, occupied };
    },
    enabled: !!id,
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase.rpc('delete_property_and_related', {
        prop_id: propertyId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Property deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      navigate('/landlord-properties');
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });

  const handleDeleteProperty = () => {
    if (property?.id) {
      deletePropertyMutation.mutate(property.id);
    }
  };

  if (isLoading) return <LoadingFallback message="Loading property details..." />;
  
  if (error) {
    toast.error('Failed to load property details');
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">Failed to load property details</p>
            <Button onClick={() => navigate('/landlord-dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!property) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Property not found</p>
            <Button onClick={() => navigate('/landlord-dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOwner = user?.id === property.landlord_id;

  const handleMaintenanceClick = () => {
    navigate(`/maintenance-requests?property=${property.id}`);
  };

  const handleManageClick = () => {
    navigate(`/manage-property/${property.id}`);
  };

  const amenities = property.property_amenities?.map(pa => pa.amenities).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      {/* Property Image Carousel */}
      <PropertyImageCarousel 
        images={propertyImages} 
        propertyTitle={property.title}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-green-800 mb-2">
                {property.title}
              </CardTitle>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}</span>
              </div>
              <div className="flex items-center text-green-600 mb-4">
                <DollarSign className="h-5 w-5 mr-1" />
                <span className="text-xl font-semibold">KES {property.monthly_rent?.toLocaleString()}/month</span>
              </div>
              
              {/* Dynamic Unit Metrics */}
              {unitStats && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Units</p>
                      <p className="font-semibold text-blue-600">{unitStats.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Home className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Vacant</p>
                      <p className="font-semibold text-green-600">{unitStats.vacant}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Occupied</p>
                      <p className="font-semibold text-orange-600">{unitStats.occupied}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {!isOwner && (
                <PropertyApplicationButton 
                  propertyId={property.id}
                  propertyOwnerId={property.landlord_id}
                  propertyTitle={property.title}
                />
              )}
              
              {isOwner && (
                <>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Property
                  </Button>
                  <Button
                    onClick={handleMaintenanceClick}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    Maintenance
                  </Button>
                  <Button
                    onClick={handleManageClick}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                  
                  {/* Delete Property Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{property.title}"? This action cannot be undone and will remove all associated data including units, tenancies, and applications.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProperty}
                          disabled={deletePropertyMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete Property'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
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

          {/* Property Description */}
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

      {/* Enhanced Property Edit Modal */}
      <PropertyEditModal
        property={property}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default PropertyDetailsPage;
