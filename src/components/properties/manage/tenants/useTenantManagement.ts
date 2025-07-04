
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TenantProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Tenancy {
  id: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  status: string;
  tenant_id: string;
  unit_id: string;
  units: {
    unit_number: string;
    unit_types: { name: string } | null;
  } | null;
  tenant_profile: TenantProfile | null;
}

interface VacantUnit {
  id: string;
  unit_number: string;
  monthly_rent: number | null;
  unit_types: { name: string } | null;
}

export const useTenantManagement = (propertyId: string) => {
  const [selectedTenancy, setSelectedTenancy] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isChangeUnitModalOpen, setIsChangeUnitModalOpen] = useState(false);
  const [isEndLeaseModalOpen, setIsEndLeaseModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current tenancies for this property
  const { data: tenancies, isLoading: tenanciesLoading } = useQuery({
    queryKey: ['property-tenancies', propertyId],
    queryFn: async (): Promise<Tenancy[]> => {
      const { data: tenanciesData, error: tenanciesError } = await supabase
        .from('tenancies')
        .select(`
          id,
          lease_start_date,
          lease_end_date,
          monthly_rent,
          status,
          tenant_id,
          unit_id,
          units(unit_number, unit_types(name))
        `)
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .order('lease_start_date', { ascending: false });
      
      if (tenanciesError) throw tenanciesError;
      if (!tenanciesData || tenanciesData.length === 0) return [];

      const tenantIds = [...new Set(tenanciesData.map(t => t.tenant_id))].filter(Boolean);
      
      if (tenantIds.length === 0) {
        return tenanciesData.map(tenancy => ({
          ...tenancy,
          tenant_profile: null
        }));
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', tenantIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return tenanciesData.map(tenancy => ({
        ...tenancy,
        tenant_profile: profilesMap.get(tenancy.tenant_id) || null
      }));
    },
  });

  // Fetch vacant units for reassignment
  const { data: vacantUnits, isLoading: unitsLoading } = useQuery({
    queryKey: ['vacant-units', propertyId],
    queryFn: async (): Promise<VacantUnit[]> => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          unit_number,
          monthly_rent,
          unit_types(name)
        `)
        .eq('property_id', propertyId)
        .eq('status', 'vacant')
        .order('unit_number');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Change unit mutation
  const changeUnitMutation = useMutation({
    mutationFn: async ({ tenancyId, newUnitId }: { tenancyId: string; newUnitId: string }) => {
      const tenancy = tenancies?.find(t => t.id === tenancyId);
      if (!tenancy) throw new Error('Tenancy not found');

      const { data: newUnit, error: unitError } = await supabase
        .from('units')
        .select('monthly_rent')
        .eq('id', newUnitId)
        .single();

      if (unitError) throw unitError;

      const { error: oldUnitError } = await supabase
        .from('units')
        .update({ status: 'vacant' })
        .eq('id', tenancy.unit_id);

      if (oldUnitError) throw oldUnitError;

      const { error: tenancyError } = await supabase
        .from('tenancies')
        .update({
          unit_id: newUnitId,
          monthly_rent: newUnit.monthly_rent || tenancy.monthly_rent
        })
        .eq('id', tenancyId);

      if (tenancyError) throw tenancyError;

      const { error: newUnitError } = await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', newUnitId);

      if (newUnitError) throw newUnitError;

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Unit changed successfully!');
      queryClient.invalidateQueries({ queryKey: ['property-tenancies', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['vacant-units', propertyId] });
      setIsChangeUnitModalOpen(false);
      setSelectedTenancy(null);
      setSelectedUnit(null);
    },
    onError: (error) => {
      console.error('Error changing unit:', error);
      toast.error('Failed to change unit. Please try again.');
    },
  });

  // End lease mutation
  const endLeaseMutation = useMutation({
    mutationFn: async (tenancyId: string) => {
      const tenancy = tenancies?.find(t => t.id === tenancyId);
      if (!tenancy) throw new Error('Tenancy not found');

      const { error: tenancyError } = await supabase
        .from('tenancies')
        .update({ status: 'ended' })
        .eq('id', tenancyId);

      if (tenancyError) throw tenancyError;

      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'vacant' })
        .eq('id', tenancy.unit_id);

      if (unitError) throw unitError;

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Lease ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['property-tenancies', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['vacant-units', propertyId] });
      setIsEndLeaseModalOpen(false);
      setSelectedTenancy(null);
    },
    onError: (error) => {
      console.error('Error ending lease:', error);
      toast.error('Failed to end lease. Please try again.');
    },
  });

  const handleChangeUnit = (tenancyId: string) => {
    setSelectedTenancy(tenancyId);
    setIsChangeUnitModalOpen(true);
  };

  const handleEndLease = (tenancyId: string) => {
    setSelectedTenancy(tenancyId);
    setIsEndLeaseModalOpen(true);
  };

  const handleConfirmChangeUnit = () => {
    if (selectedTenancy && selectedUnit) {
      changeUnitMutation.mutate({
        tenancyId: selectedTenancy,
        newUnitId: selectedUnit
      });
    }
  };

  const handleConfirmEndLease = () => {
    if (selectedTenancy) {
      endLeaseMutation.mutate(selectedTenancy);
    }
  };

  return {
    tenancies,
    tenanciesLoading,
    vacantUnits,
    unitsLoading,
    selectedUnit,
    setSelectedUnit,
    isChangeUnitModalOpen,
    setIsChangeUnitModalOpen,
    isEndLeaseModalOpen,
    setIsEndLeaseModalOpen,
    handleChangeUnit,
    handleEndLease,
    handleConfirmChangeUnit,
    handleConfirmEndLease,
    isChangingUnit: changeUnitMutation.isPending,
    isEndingLease: endLeaseMutation.isPending,
  };
};
