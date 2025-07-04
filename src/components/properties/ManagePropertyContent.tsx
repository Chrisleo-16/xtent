
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ManagePropertyHeader from './manage/ManagePropertyHeader';
import ManagePropertyNavigation from './manage/ManagePropertyNavigation';
import ManagePropertyUnits from './manage/ManagePropertyUnits';
import UnifiedTenantsPanel from './manage/UnifiedTenantsPanel';

interface ManagePropertyContentProps {
  propertyId: string;
}

const ManagePropertyContent = ({ propertyId }: ManagePropertyContentProps) => {
  const [activeTab, setActiveTab] = useState('units');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name),
          units(id, unit_number, status, monthly_rent),
          applications(id, status)
        `)
        .eq('id', propertyId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Enhanced real-time subscriptions with proper query invalidation
  useEffect(() => {
    const channel = supabase
      .channel(`property-management-${propertyId}`)
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
          queryClient.invalidateQueries({ queryKey: ['vacant-units', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['unit-stats', propertyId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `property_id=eq.${propertyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['property-applications', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
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
          queryClient.invalidateQueries({ queryKey: ['property-tenancies', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['vacant-units', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['unit-stats', propertyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
        <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/landlord-properties')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagePropertyHeader property={property} />

      {/* Two-column layout for desktop, mobile-friendly tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Navigation */}
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="lg:flex lg:flex-col">
            <ManagePropertyNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </Tabs>
        </div>

        {/* Right content area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="units" className="mt-0">
              <ManagePropertyUnits propertyId={propertyId} />
            </TabsContent>
            
            <TabsContent value="tenants" className="mt-0">
              <UnifiedTenantsPanel propertyId={propertyId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManagePropertyContent;
