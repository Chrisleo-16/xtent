
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface Amenity {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface AmenityGridProps {
  amenities: Amenity[];
  selectedAmenityIds: string[];
  onToggleAmenity: (amenityId: string) => void;
  categoryLabels: Record<string, string>;
}

const AmenityGrid = ({ amenities, selectedAmenityIds, onToggleAmenity, categoryLabels }: AmenityGridProps) => {
  // Group amenities by category
  const amenitiesByCategory = amenities.reduce((acc, amenity) => {
    const category = amenity.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  return (
    <>
      {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => (
        <div key={category}>
          <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
            {categoryLabels[category] || category}
            <Badge variant="secondary" className="text-xs">
              {categoryAmenities.length}
            </Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryAmenities.map((amenity) => {
              const isSelected = selectedAmenityIds.includes(amenity.id);
              return (
                <label
                  key={amenity.id}
                  className={`
                    flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                    ${isSelected
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleAmenity(amenity.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                      {amenity.name}
                    </div>
                    {amenity.description && (
                      <div className={`text-sm mt-1 ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
                        {amenity.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="text-green-600">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};

export default AmenityGrid;
