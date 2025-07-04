
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export interface CaretakerProperty {
  id: string;
  title: string;
  address: string;
  thumbnail_url?: string;
  status: string;
  total_units: number;
  occupied_units: number;
  pending_requests: number;
  monthly_rent: number;
}

export interface CaretakerApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  property_title: string;
  property_id: string;
  status: string;
  monthly_income?: number;
  preferred_move_in_date?: string;
  created_at: string;
}

export interface CaretakerMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  property_title: string;
  tenant_name: string;
  created_at: string;
  scheduled_date?: string;
  estimated_cost?: number;
}

export const useCaretakerData = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<CaretakerProperty[]>([]);
  const [applications, setApplications] = useState<CaretakerApplication[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<CaretakerMaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaretakerProperties = async () => {
    if (!user) return;

    try {
      // Get properties where user is assigned as caretaker
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          address,
          thumbnail_url,
          status,
          monthly_rent,
          units (
            id,
            status
          ),
          maintenance_requests (
            id,
            status
          )
        `)
        .eq('caretaker_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      const formattedProperties: CaretakerProperty[] = (propertiesData || []).map(property => ({
        id: property.id,
        title: property.title,
        address: property.address,
        thumbnail_url: property.thumbnail_url,
        status: property.status,
        total_units: property.units?.length || 0,
        occupied_units: property.units?.filter(unit => unit.status === 'occupied').length || 0,
        pending_requests: property.maintenance_requests?.filter(req => req.status === 'pending').length || 0,
        monthly_rent: property.monthly_rent
      }));

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching caretaker properties:', error);
    }
  };

  const fetchApplications = async () => {
    if (!user || properties.length === 0) return;

    try {
      const propertyIds = properties.map(p => p.id);
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          applicant_name,
          applicant_email,
          applicant_phone,
          status,
          monthly_income,
          preferred_move_in_date,
          created_at,
          property_id
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedApplications: CaretakerApplication[] = (data || []).map(app => {
        const property = properties.find(p => p.id === app.property_id);
        return {
          id: app.id,
          applicant_name: app.applicant_name,
          applicant_email: app.applicant_email,
          applicant_phone: app.applicant_phone,
          property_title: property?.title || 'Unknown Property',
          property_id: app.property_id,
          status: app.status,
          monthly_income: app.monthly_income,
          preferred_move_in_date: app.preferred_move_in_date,
          created_at: app.created_at
        };
      });

      setApplications(formattedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchMaintenanceRequests = async () => {
    if (!user || properties.length === 0) return;

    try {
      const propertyIds = properties.map(p => p.id);
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          created_at,
          scheduled_date,
          estimated_cost,
          property_id,
          tenant_id
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get tenant names for the maintenance requests
      const tenantIds = [...new Set(data?.map(req => req.tenant_id).filter(Boolean) || [])];
      let tenantNames: { [key: string]: string } = {};
      
      if (tenantIds.length > 0) {
        const { data: tenantsData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', tenantIds);
          
        tenantNames = (tenantsData || []).reduce((acc, tenant) => {
          acc[tenant.id] = tenant.name || 'Unknown Tenant';
          return acc;
        }, {} as { [key: string]: string });
      }

      const formattedRequests: CaretakerMaintenanceRequest[] = (data || []).map(req => {
        const property = properties.find(p => p.id === req.property_id);
        return {
          id: req.id,
          title: req.title,
          description: req.description,
          priority: req.priority,
          status: req.status,
          property_title: property?.title || 'Unknown Property',
          tenant_name: tenantNames[req.tenant_id] || 'Unknown Tenant',
          created_at: req.created_at,
          scheduled_date: req.scheduled_date,
          estimated_cost: req.estimated_cost
        };
      });

      setMaintenanceRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const acceptApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: 'approved' } : app)
      );

      // Create notification for landlord
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user?.id,
            title: 'Application Approved',
            message: `Application from ${application.applicant_name} for ${application.property_title} has been approved by caretaker.`,
            type: 'application'
          });
      }

      return { success: true };
    } catch (error) {
      console.error('Error accepting application:', error);
      return { success: false, error };
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: 'rejected' } : app)
      );

      // Create notification for landlord
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user?.id,
            title: 'Application Rejected',
            message: `Application from ${application.applicant_name} for ${application.property_title} has been rejected by caretaker.`,
            type: 'application'
          });
      }

      return { success: true };
    } catch (error) {
      console.error('Error rejecting application:', error);
      return { success: false, error };
    }
  };

  // Set up real-time subscriptions
  const { addListener } = useRealtimeSubscription({
    channelName: user ? `caretaker-data-${user.id}` : '',
    enabled: !!user,
    onSubscriptionChange: (status) => {
      console.log('Caretaker data subscription status:', status);
    }
  });

  // Load initial data
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setIsLoading(true);
        await fetchCaretakerProperties();
        setIsLoading(false);
      };
      loadData();
    }
  }, [user?.id]);

  // Load dependent data when properties change
  useEffect(() => {
    if (properties.length > 0) {
      fetchApplications();
      fetchMaintenanceRequests();
    }
  }, [properties.length]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (user && properties.length > 0) {
      const propertyIds = properties.map(p => p.id);
      
      // Subscribe to applications changes
      addListener(
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          if (propertyIds.includes(payload.new?.property_id)) {
            console.log('Application update:', payload);
            fetchApplications();
          }
        }
      );

      // Subscribe to maintenance requests changes
      addListener(
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          if (propertyIds.includes(payload.new?.property_id)) {
            console.log('Maintenance request update:', payload);
            fetchMaintenanceRequests();
          }
        }
      );
    }
  }, [user?.id, properties.length, addListener]);

  return {
    properties,
    applications,
    maintenanceRequests,
    isLoading,
    acceptApplication,
    rejectApplication,
    refetch: () => {
      fetchCaretakerProperties();
    }
  };
};
