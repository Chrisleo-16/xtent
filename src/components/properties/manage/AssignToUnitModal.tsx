
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface AssignToUnitModalProps {
  application: any;
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AssignToUnitModal = ({ application, propertyId, isOpen, onClose }: AssignToUnitModalProps) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const queryClient = useQueryClient();

  // Fetch vacant units
  const { data: vacantUnits = [], isLoading } = useQuery({
    queryKey: ['vacant-units', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          unit_types(name)
        `)
        .eq('property_id', propertyId)
        .eq('status', 'vacant')
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!propertyId,
  });

  // Assign tenant mutation
  const assignTenantMutation = useMutation({
    mutationFn: async () => {
      if (!application || !selectedUnitId) throw new Error('Missing required data');

      const selectedUnit = vacantUnits.find(unit => unit.id === selectedUnitId);
      if (!selectedUnit) throw new Error('Selected unit not found');

      // Check if user exists, if not create profile
      let { data: existingUser, error: userCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', application.applicant_email)
        .maybeSingle();

      let tenantId = existingUser?.id;

      if (!existingUser) {
        // Create a new user profile for the tenant
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: application.applicant_email,
            name: application.applicant_name,
            phone: application.applicant_phone,
            role: 'tenant'
          })
          .select()
          .single();

        if (profileError) throw profileError;
        tenantId = newProfile.id;
      }

      // Get property details for landlord_id
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      // Create tenancy
      const { error: tenancyError } = await supabase
        .from('tenancies')
        .insert({
          property_id: propertyId,
          unit_id: selectedUnitId,
          tenant_id: tenantId,
          landlord_id: property.landlord_id,
          lease_start_date: new Date().toISOString().split('T')[0],
          lease_end_date: leaseEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monthly_rent: selectedUnit.monthly_rent || 0,
          security_deposit: securityDeposit ? parseInt(securityDeposit) : 0,
          status: 'active'
        });

      if (tenancyError) throw tenancyError;

      // Update unit status to occupied
      const { error: unitUpdateError } = await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', selectedUnitId);

      if (unitUpdateError) throw unitUpdateError;

      // Update application status to approved
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', application.id);

      if (appError) throw appError;

      return { tenantId, applicationId: application.id };
    },
    onSuccess: () => {
      toast.success('Tenant assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-applications', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-tenancies', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['vacant-units', propertyId] });
      onClose();
      setSelectedUnitId('');
      setLeaseEndDate('');
      setSecurityDeposit('');
    },
    onError: (error) => {
      toast.error(`Failed to assign tenant: ${error.message}`);
    },
  });

  const handleAssign = () => {
    if (!selectedUnitId) {
      toast.error('Please select a unit');
      return;
    }
    assignTenantMutation.mutate();
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Tenant to Unit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Applicant Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Applicant Information</h4>
              <p><strong>Name:</strong> {application.applicant_name}</p>
              <p><strong>Email:</strong> {application.applicant_email}</p>
              {application.applicant_phone && (
                <p><strong>Phone:</strong> {application.applicant_phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Unit Selection */}
          <div>
            <Label htmlFor="unit-select">Select Available Unit *</Label>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger id="unit-select">
                <SelectValue placeholder="Choose a vacant unit" />
              </SelectTrigger>
              <SelectContent>
                {vacantUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Unit {unit.unit_number} ({unit.unit_types?.name})</span>
                      {unit.monthly_rent && (
                        <Badge variant="outline">
                          KES {unit.monthly_rent.toLocaleString()}/month
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lease-end">Lease End Date</Label>
              <Input
                id="lease-end"
                type="date"
                value={leaseEndDate}
                onChange={(e) => setLeaseEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="security-deposit">Security Deposit (KES)</Label>
              <Input
                id="security-deposit"
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedUnitId || assignTenantMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {assignTenantMutation.isPending ? 'Assigning...' : 'Assign Tenant'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignToUnitModal;
