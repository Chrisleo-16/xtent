
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Check, X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import AddUnitModal from '../management/AddUnitModal';
import AssignTenantModal from '../management/AssignTenantModal';
import { useUnitTypes } from '@/hooks/useUnitTypes';

interface ManagePropertyUnitsProps {
  propertyId: string;
}

const ManagePropertyUnits = ({ propertyId }: ManagePropertyUnitsProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ monthly_rent: string; status: string }>({
    monthly_rent: '',
    status: ''
  });
  
  const queryClient = useQueryClient();
  const { data: unitTypes = [] } = useUnitTypes();

  // Fetch units with tenant information
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          unit_types(name),
          tenancies!tenancies_unit_id_fkey(
            id,
            tenant_id,
            status,
            profiles!tenancies_tenant_id_fkey(name, email)
          )
        `)
        .eq('property_id', propertyId)
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for units
  useEffect(() => {
    const channel = supabase
      .channel('units-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'units',
          filter: `property_id=eq.${propertyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenancies',
          filter: `property_id=eq.${propertyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, queryClient]);

  // Update unit mutation
  const updateUnitMutation = useMutation({
    mutationFn: async ({ unitId, data }: { unitId: string; data: any }) => {
      const { error } = await supabase
        .from('units')
        .update(data)
        .eq('id', unitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Unit updated successfully');
      setEditingUnit(null);
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
    },
    onError: (error) => {
      toast.error(`Failed to update unit: ${error.message}`);
    },
  });

  // Delete unit mutation
  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Unit deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
    },
    onError: (error) => {
      toast.error(`Failed to delete unit: ${error.message}`);
    },
  });

  const handleStartEdit = (unit: any) => {
    setEditingUnit(unit.id);
    setEditValues({
      monthly_rent: unit.monthly_rent?.toString() || '',
      status: unit.status || 'vacant'
    });
  };

  const handleSaveEdit = () => {
    if (!editingUnit) return;
    
    updateUnitMutation.mutate({
      unitId: editingUnit,
      data: {
        monthly_rent: editValues.monthly_rent ? parseInt(editValues.monthly_rent) : null,
        status: editValues.status
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setEditValues({ monthly_rent: '', status: '' });
  };

  const handleDeleteUnit = (unitId: string) => {
    if (window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      deleteUnitMutation.mutate(unitId);
    }
  };

  const handleAssignTenant = (unitId: string) => {
    setSelectedUnitId(unitId);
    setIsAssignModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'vacant':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignedTenant = (unit: any) => {
    const activeTenancy = unit.tenancies?.find((t: any) => t.status === 'active');
    return activeTenancy?.profiles?.name || null;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading units...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Property Units ({units.length})</CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Unit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {units.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No units found for this property.</p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4"
                variant="outline"
              >
                Add Your First Unit
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Tenant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => {
                    const assignedTenant = getAssignedTenant(unit);
                    return (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.unit_number}</TableCell>
                        <TableCell>{unit.unit_types?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {editingUnit === unit.id ? (
                            <Input
                              type="number"
                              value={editValues.monthly_rent}
                              onChange={(e) => setEditValues(prev => ({ ...prev, monthly_rent: e.target.value }))}
                              placeholder="Enter rent amount"
                              className="w-32"
                            />
                          ) : (
                            unit.monthly_rent ? `KES ${unit.monthly_rent.toLocaleString()}` : 'Not set'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUnit === unit.id ? (
                            <Select
                              value={editValues.status}
                              onValueChange={(value) => setEditValues(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vacant">Vacant</SelectItem>
                                <SelectItem value="occupied">Occupied</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStatusColor(unit.status)}>
                              {unit.status || 'vacant'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {assignedTenant ? (
                            <span className="text-sm font-medium">{assignedTenant}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">No tenant</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUnit === unit.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={updateUnitMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {unit.status === 'vacant' && !assignedTenant && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleAssignTenant(unit.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(unit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUnit(unit.id)}
                                disabled={deleteUnitMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddUnitModal
        propertyId={propertyId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <AssignTenantModal
        propertyId={propertyId}
        unitId={selectedUnitId}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUnitId(null);
        }}
      />
    </div>
  );
};

export default ManagePropertyUnits;
