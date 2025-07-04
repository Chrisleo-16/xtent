
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Home, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import ChangeUnitModal from './ChangeUnitModal';

interface CurrentTenantsTableProps {
  landlordId: string;
}

const CurrentTenantsTable = ({ landlordId }: CurrentTenantsTableProps) => {
  const [selectedTenancy, setSelectedTenancy] = useState<any>(null);
  const [isChangeUnitModalOpen, setIsChangeUnitModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current tenancies
  const { data: tenancies = [], isLoading } = useQuery({
    queryKey: ['current-tenancies', landlordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          properties (
            id,
            title,
            address
          ),
          units (
            id,
            unit_number,
            unit_types (
              name
            )
          )
        `)
        .eq('landlord_id', landlordId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('tenancies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenancies',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['current-tenancies', landlordId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [landlordId, queryClient]);

  // Change unit mutation
  const changeUnitMutation = useMutation({
    mutationFn: async ({ tenancyId, newUnitId, oldUnitId }: { 
      tenancyId: string; 
      newUnitId: string; 
      oldUnitId: string; 
    }) => {
      // Update tenancy with new unit
      const { error: tenancyError } = await supabase
        .from('tenancies')
        .update({
          unit_id: newUnitId,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenancyId);

      if (tenancyError) throw tenancyError;

      // Update new unit status to occupied
      const { error: newUnitError } = await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', newUnitId);

      if (newUnitError) throw newUnitError;

      // Update old unit status to vacant
      const { error: oldUnitError } = await supabase
        .from('units')
        .update({ status: 'vacant' })
        .eq('id', oldUnitId);

      if (oldUnitError) throw oldUnitError;
    },
    onSuccess: () => {
      toast.success('Unit changed successfully!');
      queryClient.invalidateQueries({ queryKey: ['current-tenancies', landlordId] });
      setIsChangeUnitModalOpen(false);
      setSelectedTenancy(null);
    },
    onError: (error) => {
      toast.error(`Failed to change unit: ${error.message}`);
    }
  });

  const handleChangeUnit = (tenancy: any) => {
    setSelectedTenancy(tenancy);
    setIsChangeUnitModalOpen(true);
  };

  const handleUnitChange = (newUnitId: string) => {
    if (selectedTenancy) {
      changeUnitMutation.mutate({
        tenancyId: selectedTenancy.id,
        newUnitId,
        oldUnitId: selectedTenancy.unit_id
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading current tenants...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {tenancies.length === 0 ? (
          <div className="text-center py-8">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No current tenants found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Active tenancies will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Lease Start</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenancies.map((tenancy) => (
                    <TableRow key={tenancy.id}>
                      <TableCell>
                        <div className="font-medium">{tenancy.tenant_id}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tenancy.properties?.title}</div>
                          <div className="text-sm text-gray-500">{tenancy.properties?.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Unit {tenancy.units?.unit_number}</div>
                          {tenancy.units?.unit_types && (
                            <div className="text-sm text-gray-500">{tenancy.units.unit_types.name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenancy.monthly_rent > 0 && (
                          <div className="font-medium">
                            KES {tenancy.monthly_rent.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(tenancy.lease_start_date), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {tenancy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangeUnit(tenancy)}
                          disabled={changeUnitMutation.isPending}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-1" />
                          Change Unit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-4">
              {tenancies.map((tenancy) => (
                <div key={tenancy.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{tenancy.tenant_id}</h3>
                      <p className="text-sm text-gray-500">{tenancy.properties?.title}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {tenancy.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium text-sm">Unit {tenancy.units?.unit_number}</p>
                    {tenancy.units?.unit_types && (
                      <p className="text-xs text-gray-500">{tenancy.units.unit_types.name}</p>
                    )}
                    {tenancy.monthly_rent > 0 && (
                      <p className="text-sm font-medium text-green-600">
                        KES {tenancy.monthly_rent.toLocaleString()}/month
                      </p>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Started {formatDistanceToNow(new Date(tenancy.lease_start_date), { addSuffix: true })}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleChangeUnit(tenancy)}
                    disabled={changeUnitMutation.isPending}
                    className="w-full"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Change Unit
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ChangeUnitModal
        isOpen={isChangeUnitModalOpen}
        onClose={() => {
          setIsChangeUnitModalOpen(false);
          setSelectedTenancy(null);
        }}
        propertyId={selectedTenancy?.property_id}
        currentUnitId={selectedTenancy?.unit_id}
        onUnitChange={handleUnitChange}
        isLoading={changeUnitMutation.isPending}
      />
    </>
  );
};

export default CurrentTenantsTable;
