
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Home, CheckCircle, AlertCircle, ListPlus } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import { useLandlordProperties } from '@/hooks/useLandlordProperties';
import { usePropertyListing } from '@/hooks/usePropertyListing';
import { useNavigate } from 'react-router-dom';

export const ListPropertyTool = () => {
  const { profile } = useVerification();
  const navigate = useNavigate();
  const { data: properties = [], isLoading } = useLandlordProperties();
  const { listProperty } = usePropertyListing();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Check if user is verified
  const isVerified = profile?.verification_status === 'verified';

  const handleListProperty = async () => {
    if (!selectedPropertyId) return;
    
    if (!isVerified) {
      navigate('/verification');
      return;
    }

    try {
      await listProperty.mutateAsync(selectedPropertyId);
      setSelectedPropertyId('');
    } catch (error) {
      console.error('Failed to list property:', error);
    }
  };

  // Filter properties that are not listed (status is not 'available')
  const unlistedProperties = properties.filter(p => p.status !== 'available');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading properties...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5" />
            List Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Verification Required</h3>
            <p className="text-gray-600 mb-4">
              You need to complete account verification before you can list properties.
            </p>
            <Button onClick={() => navigate('/verification')} className="bg-green-600 hover:bg-green-700">
              Complete Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (unlistedProperties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5" />
            List Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">All Properties Listed</h3>
            <p className="text-gray-600">
              All your properties are already listed and visible to potential tenants.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListPlus className="h-5 w-5" />
          List Property
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Make your properties visible to potential tenants by listing them.
        </p>

        <div className="space-y-3">
          <label className="text-sm font-medium">Select Property to List</label>
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a property" />
            </SelectTrigger>
            <SelectContent>
              {unlistedProperties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>{property.title}</span>
                    <Badge variant="secondary">KES {property.monthly_rent?.toLocaleString()}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleListProperty}
          disabled={!selectedPropertyId || listProperty.isPending}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {listProperty.isPending ? 'Listing Property...' : 'List Property'}
        </Button>

        <div className="text-sm text-gray-500">
          <p>✓ Property will be visible to potential tenants</p>
          <p>✓ You'll receive applications and inquiries</p>
          <p>✓ You can unlist anytime from the Properties page</p>
        </div>
      </CardContent>
    </Card>
  );
};
