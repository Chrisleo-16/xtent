
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface EndLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEnding: boolean;
}

const EndLeaseModal = ({ isOpen, onClose, onConfirm, isEnding }: EndLeaseModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Lease</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Are you sure you want to end this lease?</p>
              <p className="text-sm text-red-600 mt-1">
                This will mark the tenancy as ended and make the unit available for new tenants.
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isEnding}
              className="bg-red-600 hover:bg-red-700"
            >
              {isEnding ? 'Ending Lease...' : 'End Lease'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EndLeaseModal;
