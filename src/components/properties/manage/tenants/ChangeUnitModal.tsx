
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface VacantUnit {
  id: string;
  unit_number: string;
  monthly_rent: number | null;
  unit_types: { name: string } | null;
}

interface ChangeUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacantUnits: VacantUnit[] | undefined;
  unitsLoading: boolean;
  selectedUnit: string | null;
  onUnitSelect: (unitId: string) => void;
  onConfirm: () => void;
  isChanging: boolean;
}

const ChangeUnitModal = ({
  isOpen,
  onClose,
  vacantUnits,
  unitsLoading,
  selectedUnit,
  onUnitSelect,
  onConfirm,
  isChanging
}: ChangeUnitModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Unit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Select a vacant unit to move this tenant to:
            </p>
            
            {unitsLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : (
              <Select value={selectedUnit || ''} onValueChange={onUnitSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {vacantUnits?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unit_number} - {unit.unit_types?.name} - KES {unit.monthly_rent?.toLocaleString()}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {vacantUnits && vacantUnits.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                No vacant units available. Please add units or mark existing units as vacant.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!selectedUnit || isChanging}
              className="bg-green-600 hover:bg-green-700"
            >
              {isChanging ? 'Changing...' : 'Change Unit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUnitModal;
