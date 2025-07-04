
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PropertyEditModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyEditModal = ({ property, isOpen, onClose }: PropertyEditModalProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    property_type_id: property?.property_type_id || '',
    custom_type: property?.custom_type || '',
    is_single_unit: property?.is_single_unit || false,
    address: property?.address || '',
    amenities: property?.amenities || [],
    thumbnail_url: property?.thumbnail_url || '',
  });

  const [customAmenity, setCustomAmenity] = useState('');

  // Fetch property types
  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['propertyTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('properties')
        .update(data)
        .eq('id', property.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Property updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to update property: ${error.message}`);
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_property_and_related', {
        prop_id: property.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Property deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      navigate('/landlord-properties');
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePropertyMutation.mutate(formData);
  };

  const handleDeleteProperty = () => {
    deletePropertyMutation.mutate();
  };

  const addAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Property</DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property Name</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_type_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.property_type_id === 'other' && (
              <div>
                <Label htmlFor="custom_type">Custom Property Type</Label>
                <Input
                  id="custom_type"
                  value={formData.custom_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_type: e.target.value }))}
                  placeholder="Enter custom property type"
                />
              </div>
            )}
          </div>

          {/* Single Unit Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_single_unit"
              checked={formData.is_single_unit}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_single_unit: checked }))}
            />
            <Label htmlFor="is_single_unit">Single Unit Property</Label>
          </div>

          {/* Thumbnail URL */}
          <div>
            <Label htmlFor="thumbnail_url">Property Image URL</Label>
            <Input
              id="thumbnail_url"
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Amenities */}
          <div>
            <Label>Amenities</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Add amenity"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Property
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Property
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-3">
                      <p>
                        <strong>Warning:</strong> This action cannot be undone. Deleting this property will permanently remove:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>The property "{property.title}"</li>
                        <li>All associated units and tenant assignments</li>
                        <li>All applications and communications</li>
                        <li>All utility bills and payments</li>
                        <li>All maintenance requests</li>
                        <li>All property images and data</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProperty}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deletePropertyMutation.isPending}
                  >
                    {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete Property'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updatePropertyMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updatePropertyMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;
