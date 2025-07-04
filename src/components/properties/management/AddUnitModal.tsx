
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useUnitTypes } from '@/hooks/useUnitTypes';

const unitSchema = z.object({
  unit_number: z.string().min(1, 'Unit number is required'),
  unit_type_id: z.string().uuid('Please select a unit type'),
  monthly_rent: z.coerce.number().int().positive('Rent must be a positive number').optional(),
  status: z.enum(['vacant', 'occupied', 'maintenance']).default('vacant'),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface AddUnitModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddUnitModal = ({ propertyId, isOpen, onClose }: AddUnitModalProps) => {
  const queryClient = useQueryClient();
  const { data: unitTypes = [] } = useUnitTypes();

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unit_number: '',
      unit_type_id: '',
      monthly_rent: undefined,
      status: 'vacant',
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: UnitFormValues) => {
      const { error } = await supabase
        .from('units')
        .insert([{
          property_id: propertyId,
          unit_number: data.unit_number,
          unit_type_id: data.unit_type_id,
          monthly_rent: data.monthly_rent || null,
          status: data.status,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Unit added successfully');
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to add unit: ${error.message}`);
    },
  });

  const onSubmit = (data: UnitFormValues) => {
    createUnitMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="unit_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1A, 201, Ground Floor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthly_rent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (KES)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter rent amount"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createUnitMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createUnitMutation.isPending ? 'Adding...' : 'Add Unit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUnitModal;
