
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
import { ArrowRightLeft } from 'lucide-react';

interface ChangeUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  currentUnitId?: string;
  onUnitChange: (unitId: string) => void;
  isLoading?: boolean;
}

const ChangeUnitModal = ({
  isOpen,
  onClose,
  propertyId,
  currentUnitId,
  onUnitChange,
  isLoading = false
}: ChangeUnitModalProps) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Fetch available units (vacant + current unit)
  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['available-units', propertyId, currentUnitId],
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
        .or(`status.eq.vacant,id.eq.${currentUnitId}`)
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId && isOpen,
  });

  const handleConfirm = () => {
    if (selectedUnitId && selectedUnitId !== currentUnitId) {
      onUnitChange(selectedUnitId);
    }
  };

  const availableUnits = units.filter(unit => unit.id !== currentUnitId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Change Tenant Unit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {unitsLoading ? (
            <div className="text-center py-4">Loading available units...</div>
          ) : availableUnits.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No other units available for this property.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableUnits.map((unit) => (
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
              disabled={!selectedUnitId || selectedUnitId === currentUnitId || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Changing...' : 'Change Unit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUnitModal;
