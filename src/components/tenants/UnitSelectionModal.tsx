
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  onUnitSelect: (unitId: string) => void;
  isLoading?: boolean;
}

const UnitSelectionModal = ({
  isOpen,
  onClose,
  propertyId,
  onUnitSelect,
  isLoading = false
}: UnitSelectionModalProps) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Fetch vacant units for the property
  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['vacant-units', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          unit_types (
            name,
            description
          )
        `)
        .eq('property_id', propertyId)
        .eq('status', 'vacant')
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId && isOpen,
  });

  const handleConfirm = () => {
    if (selectedUnitId) {
      onUnitSelect(selectedUnitId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Select Unit for Tenant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {unitsLoading ? (
            <div className="text-center py-4">Loading available units...</div>
          ) : units.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No vacant units available for this property.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {units.map((unit) => (
                <Card
                  key={unit.id}
                  className={`cursor-pointer transition-all ${
                    selectedUnitId === unit.id
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUnitId(unit.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Unit {unit.unit_number}</h4>
                        {unit.unit_types && (
                          <p className="text-sm text-gray-500">{unit.unit_types.name}</p>
                        )}
                        {unit.monthly_rent > 0 && (
                          <p className="text-sm font-medium text-green-600">
                            KES {unit.monthly_rent.toLocaleString()}/month
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="unit"
                          checked={selectedUnitId === unit.id}
                          onChange={() => setSelectedUnitId(unit.id)}
                          className="h-4 w-4 text-green-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedUnitId || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Assigning...' : 'Assign Unit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitSelectionModal;
