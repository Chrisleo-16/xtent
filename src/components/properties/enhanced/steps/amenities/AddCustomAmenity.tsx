
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddCustomAmenityProps {
  selectedAmenityIds: string[];
  onAmenityAdded: (amenityId: string) => void;
  onRefetch: () => void;
}

const AddCustomAmenity = ({ selectedAmenityIds, onAmenityAdded, onRefetch }: AddCustomAmenityProps) => {
  const [showAddAmenity, setShowAddAmenity] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityDescription, setNewAmenityDescription] = useState('');

  const addCustomAmenity = async () => {
    if (!newAmenityName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('amenities')
        .insert({
          name: newAmenityName,
          description: newAmenityDescription,
          category: 'custom',
        })
        .select()
        .single();

      if (error) throw error;

      onAmenityAdded(data.id);
      
      setNewAmenityName('');
      setNewAmenityDescription('');
      setShowAddAmenity(false);
      
      onRefetch();
      toast.success('Custom amenity added successfully');
    } catch (error) {
      console.error('Error adding amenity:', error);
      toast.error('Failed to add custom amenity');
    }
  };

  return (
    <div className="flex justify-center pt-4 border-t border-gray-100">
      <Dialog open={showAddAmenity} onOpenChange={setShowAddAmenity}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
            <Plus className="h-4 w-4" />
            Add Custom Amenity
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Amenity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amenity Name *</label>
              <Input
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                placeholder="e.g., Rooftop Garden, Co-working Space"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                value={newAmenityDescription}
                onChange={(e) => setNewAmenityDescription(e.target.value)}
                placeholder="Brief description of this amenity"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddAmenity(false)}>
                Cancel
              </Button>
              <Button 
                onClick={addCustomAmenity} 
                disabled={!newAmenityName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Amenity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCustomAmenity;
