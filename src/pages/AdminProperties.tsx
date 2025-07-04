
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, Search, Filter, Eye, MapPin, 
  User, Calendar, DollarSign, Home
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'unavailable';

const AdminProperties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');

  // Fetch all properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['adminProperties', statusFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          landlord:profiles!properties_landlord_id_fkey(name, email),
          units(id, status),
          tenancies(id, status)
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      let filtered = data || [];
      if (searchTerm) {
        filtered = filtered.filter(property =>
          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.landlord?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filtered;
    }
  });

  const getStatusBadge = (status: string) => {
    const config = {
      available: { color: 'bg-green-100 text-green-700', label: 'Available' },
      occupied: { color: 'bg-blue-100 text-blue-700', label: 'Occupied' },
      maintenance: { color: 'bg-yellow-100 text-yellow-700', label: 'Maintenance' },
      unavailable: { color: 'bg-red-100 text-red-700', label: 'Unavailable' }
    };
    
    const { color, label } = config[status as keyof typeof config] || config.available;
    
    return (
      <Badge className={`${color} border-0`}>
        {label}
      </Badge>
    );
  };

  const getOccupancyStats = (property: any) => {
    const totalUnits = property.units?.length || 0;
    const occupiedUnits = property.tenancies?.filter((t: any) => t.status === 'active').length || 0;
    return { total: totalUnits, occupied: occupiedUnits };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="admin" />
        
        <SidebarInset>
          <div className="p-4 md:p-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Building className="h-8 w-8 text-green-600" />
                    Property Management
                  </h1>
                  <p className="text-gray-600 mt-1">Monitor and manage all properties in the system</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {properties.length} Total Properties
                </Badge>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by title, address, or landlord..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(value: 'all' | PropertyStatus) => setStatusFilter(value)}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Properties Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading properties...</div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No properties found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Landlord</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Occupancy</TableHead>
                            <TableHead>Rent</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {properties.map((property) => {
                            const occupancy = getOccupancyStats(property);
                            return (
                              <TableRow key={property.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-medium">{property.title}</p>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <MapPin className="h-3 w-3" />
                                      {property.address}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span>{property.bedrooms} bed</span>
                                      <span>{property.bathrooms} bath</span>
                                      {property.size_sqft && <span>{property.size_sqft} sqft</span>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                      <User className="h-3 w-3 text-gray-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{property.landlord?.name || 'N/A'}</p>
                                      <p className="text-xs text-gray-500">{property.landlord?.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(property.status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">
                                      {occupancy.occupied}/{occupancy.total} units
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm font-medium">
                                      KES {property.monthly_rent?.toLocaleString()}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    {new Date(property.created_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Link to={`/property-details/${property.id}`}>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminProperties;
