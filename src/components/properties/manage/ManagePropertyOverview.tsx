
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Building, Users, FileText, Wrench, MapPin, Calendar, DollarSign } from 'lucide-react';

interface ManagePropertyOverviewProps {
  property: any;
}

const ManagePropertyOverview = ({ property }: ManagePropertyOverviewProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  // Fetch property statistics
  const { data: stats } = useQuery({
    queryKey: ['property-stats', property.id],
    queryFn: async () => {
      const [unitsResult, applicationsResult, maintenanceResult] = await Promise.all([
        supabase
          .from('units')
          .select('status')
          .eq('property_id', property.id),
        supabase
          .from('applications')
          .select('status')
          .eq('property_id', property.id),
        supabase
          .from('maintenance_requests')
          .select('status')
          .eq('property_id', property.id)
      ]);

      const units = unitsResult.data || [];
      const applications = applicationsResult.data || [];
      const maintenance = maintenanceResult.data || [];

      return {
        totalUnits: units.length,
        occupiedUnits: units.filter(u => u.status === 'occupied').length,
        vacantUnits: units.filter(u => u.status === 'vacant').length,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        openMaintenanceTickets: maintenance.filter(m => m.status === 'pending').length,
      };
    },
  });

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
    <div className="space-y-6">
      {/* Property Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Property Image */}
            <div className="flex-shrink-0">
              <div className="w-full lg:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden">
                {property.thumbnail_url ? (
                  <img 
                    src={property.thumbnail_url} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold">{property.title}</h2>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.address}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
                {property.size_sqft && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.size_sqft}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                )}
                {property.monthly_rent && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">KES {property.monthly_rent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Monthly Rent</div>
                  </div>
                )}
              </div>

              {property.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{property.description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.totalUnits || 0}</div>
                <div className="text-sm text-gray-600">Total Units</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.occupiedUnits || 0}</div>
                <div className="text-sm text-gray-600">Occupied Units</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
                <div className="text-sm text-gray-600">Pending Applications</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Wrench className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.openMaintenanceTickets || 0}</div>
                <div className="text-sm text-gray-600">Open Tickets</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Preview */}
      {property.latitude && property.longitude && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg overflow-hidden">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={{ lat: property.latitude, lng: property.longitude }}
                  zoom={15}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  <Marker
                    position={{ lat: property.latitude, lng: property.longitude }}
                  />
                </GoogleMap>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>{property.address}</p>
              <p>Coordinates: {property.latitude?.toFixed(6)}, {property.longitude?.toFixed(6)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManagePropertyOverview;
