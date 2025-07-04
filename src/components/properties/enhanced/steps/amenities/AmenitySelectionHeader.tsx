
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckSquare, Square } from 'lucide-react';

interface AmenitySelectionHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAllSelected: boolean;
}

const AmenitySelectionHeader = ({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onDeselectAll,
  isAllSelected 
}: AmenitySelectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Property Amenities & Features</h3>
        <Badge variant="outline" className="text-lg px-3 py-1 bg-green-50 text-green-800 border-green-200">
          {selectedCount} Selected
        </Badge>
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-2"
      >
        {isAllSelected ? (
          <>
            <Square className="h-4 w-4" />
            Deselect All
          </>
        ) : (
          <>
            <CheckSquare className="h-4 w-4" />
            Select All
          </>
        )}
      </Button>
    </div>
  );
};

export default AmenitySelectionHeader;
