
import { UseFormReturn } from 'react-hook-form';
import { useAmenities } from '@/hooks/useAmenities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';

import AmenitySearch from './amenities/AmenitySearch';
import AmenityGrid from './amenities/AmenityGrid';
import AddCustomAmenity from './amenities/AddCustomAmenity';
import AmenitySelectionHeader from './amenities/AmenitySelectionHeader';

interface AmenitiesStepProps {
  form: UseFormReturn<any>;
}

const AmenitiesStep = ({ form }: AmenitiesStepProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: amenities = [], isLoading, error, refetch } = useAmenities();

  const selectedAmenityIds = form.watch('amenities') || [];

  const toggleAmenity = (amenityId: string) => {
    const current = selectedAmenityIds;
    const isSelected = current.includes(amenityId);
    
    if (isSelected) {
      form.setValue('amenities', current.filter((id: string) => id !== amenityId));
    } else {
      form.setValue('amenities', [...current, amenityId]);
    }
  };

  const handleSelectAll = () => {
    const allAmenityIds = filteredAmenities.map(amenity => amenity.id);
    const currentSelected = selectedAmenityIds;
    const newSelection = [...new Set([...currentSelected, ...allAmenityIds])];
    form.setValue('amenities', newSelection);
  };

  const handleDeselectAll = () => {
    const allAmenityIds = filteredAmenities.map(amenity => amenity.id);
    const newSelection = selectedAmenityIds.filter((id: string) => !allAmenityIds.includes(id));
    form.setValue('amenities', newSelection);
  };

  const handleAmenityAdded = (amenityId: string) => {
    form.setValue('amenities', [...selectedAmenityIds, amenityId]);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredAmenities = amenities.filter(amenity =>
    amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (amenity.description && amenity.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAllFilteredSelected = filteredAmenities.length > 0 && 
    filteredAmenities.every(amenity => selectedAmenityIds.includes(amenity.id));

  const categoryLabels: Record<string, string> = {
    parking: 'Parking & Transport',
    recreation: 'Recreation & Leisure',
    security: 'Security & Safety',
    building: 'Building Features',
    climate: 'Climate Control',
    outdoor: 'Outdoor Spaces',
    utilities: 'Utilities & Services',
    lifestyle: 'Lifestyle',
    kitchen: 'Kitchen & Dining',
    storage: 'Storage',
    custom: 'Custom Amenities',
    general: 'General',
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 mb-4">Failed to load amenities</p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <AmenitySelectionHeader
            selectedCount={selectedAmenityIds.length}
            totalCount={amenities.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            isAllSelected={isAllFilteredSelected}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <AmenitySearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={clearSearch}
          />

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
              <p>Loading amenities...</p>
            </div>
          ) : filteredAmenities.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No amenities found matching "{searchQuery}"</p>
              <Button variant="outline" onClick={clearSearch} className="mt-2">
                Clear Search
              </Button>
            </div>
          ) : (
            <AmenityGrid
              amenities={filteredAmenities}
              selectedAmenityIds={selectedAmenityIds}
              onToggleAmenity={toggleAmenity}
              categoryLabels={categoryLabels}
            />
          )}

          <AddCustomAmenity
            selectedAmenityIds={selectedAmenityIds}
            onAmenityAdded={handleAmenityAdded}
            onRefetch={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AmenitiesStep;
