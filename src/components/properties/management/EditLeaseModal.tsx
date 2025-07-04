
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useEffect } from 'react';

const leaseSchema = z.object({
  lease_start_date: z.string().min(1, 'Start date is required'),
  lease_end_date: z.string().min(1, 'End date is required'),
  monthly_rent: z.coerce.number().int().positive('Rent must be a positive number'),
  security_deposit: z.coerce.number().int().min(0, 'Security deposit cannot be negative'),
  lease_terms: z.string().optional(),
});

type LeaseFormValues = z.infer<typeof leaseSchema>;

interface EditLeaseModalProps {
  tenancy: any;
  isOpen: boolean;
  onClose: () => void;
}

const EditLeaseModal = ({ tenancy, isOpen, onClose }: EditLeaseModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      lease_start_date: '',
      lease_end_date: '',
      monthly_rent: 0,
      security_deposit: 0,
      lease_terms: '',
    },
  });

  // Reset form when tenancy changes
  useEffect(() => {
    if (tenancy) {
      form.reset({
        lease_start_date: format(new Date(tenancy.lease_start_date), 'yyyy-MM-dd'),
        lease_end_date: format(new Date(tenancy.lease_end_date), 'yyyy-MM-dd'),
        monthly_rent: tenancy.monthly_rent || 0,
        security_deposit: tenancy.security_deposit || 0,
        lease_terms: tenancy.lease_terms || '',
      });
    }
  }, [tenancy, form]);

  const updateTenancyMutation = useMutation({
    mutationFn: async (data: LeaseFormValues) => {
      const { error } = await supabase
        .from('tenancies')
        .update({
          lease_start_date: data.lease_start_date,
          lease_end_date: data.lease_end_date,
          monthly_rent: data.monthly_rent,
          security_deposit: data.security_deposit,
          lease_terms: data.lease_terms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenancy.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lease updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tenancies', tenancy.property_id] });
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to update lease: ${error.message}`);
    },
  });

  const onSubmit = (data: LeaseFormValues) => {
    updateTenancyMutation.mutate(data);
  };

  if (!tenancy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Lease Terms</DialogTitle>
          <p className="text-sm text-gray-600">
            Tenant: {tenancy.tenant?.name} - Unit {tenancy.unit?.unit_number}
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lease_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lease_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="monthly_rent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (KES) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter rent amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="security_deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Deposit (KES)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter deposit amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lease_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lease Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any special terms or conditions for this lease..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
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
                disabled={updateTenancyMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updateTenancyMutation.isPending ? 'Updating...' : 'Update Lease'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeaseModal;
