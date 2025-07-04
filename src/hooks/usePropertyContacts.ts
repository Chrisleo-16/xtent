
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PropertyContact {
  id: string;
  name: string;
  email: string;
  role: string;
  property_title?: string;
  property_id?: string;
}

export const usePropertyContacts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property-contacts', user?.id],
    queryFn: async (): Promise<PropertyContact[]> => {
      if (!user) return [];

      const userRole = user?.user_metadata?.role || 'tenant';
      const contacts: PropertyContact[] = [];

      try {
        if (userRole === 'tenant') {
          // Get tenant's properties and their landlords/caretakers
          const { data: leases, error: leasesError } = await supabase
            .from('leases')
            .select(`
              property_id,
              landlord_id,
              properties!inner(
                id,
                title,
                landlord_id,
                caretaker_id
              )
            `)
            .eq('tenant_id', user.id)
            .eq('status', 'active');

          if (leasesError) throw leasesError;

          // Get landlord and caretaker details for each property
          for (const lease of leases || []) {
            // Add landlord
            if (lease.landlord_id) {
              const { data: landlord, error: landlordError } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .eq('id', lease.landlord_id)
                .single();

              if (!landlordError && landlord) {
                contacts.push({
                  id: landlord.id,
                  name: landlord.name || 'Landlord',
                  email: landlord.email || '',
                  role: landlord.role || 'landlord',
                  property_title: lease.properties?.title,
                  property_id: lease.property_id,
                });
              }
            }

            // Add caretaker if assigned
            if (lease.properties?.caretaker_id) {
              const { data: caretaker, error: caretakerError } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .eq('id', lease.properties.caretaker_id)
                .single();

              if (!caretakerError && caretaker) {
                contacts.push({
                  id: caretaker.id,
                  name: caretaker.name || 'Caretaker',
                  email: caretaker.email || '',
                  role: caretaker.role || 'caretaker',
                  property_title: lease.properties?.title,
                  property_id: lease.property_id,
                });
              }
            }
          }
          
        } else if (userRole === 'landlord') {
          // Get landlord's tenants and caretakers
          const { data: properties, error: propertiesError } = await supabase
            .from('properties')
            .select(`
              id,
              title,
              caretaker_id
            `)
            .eq('landlord_id', user.id);

          if (!propertiesError && properties) {
            const propertyIds = properties.map(p => p.id);

            // Get tenants for landlord's properties
            const { data: tenants, error: tenantsError } = await supabase
              .from('leases')
              .select(`
                tenant_id,
                property_id,
                profiles!inner(
                  id,
                  name,
                  email,
                  role
                ),
                properties!inner(
                  id,
                  title
                )
              `)
              .in('property_id', propertyIds)
              .eq('status', 'active');

            if (!tenantsError && tenants) {
              tenants.forEach((lease: any) => {
                if (lease.profiles) {
                  contacts.push({
                    id: lease.profiles.id,
                    name: lease.profiles.name || 'Tenant',
                    email: lease.profiles.email || '',
                    role: lease.profiles.role || 'tenant',
                    property_title: lease.properties?.title,
                    property_id: lease.property_id,
                  });
                }
              });
            }

            // Get caretakers for landlord's properties
            for (const property of properties) {
              if (property.caretaker_id) {
                const { data: caretaker, error: caretakerError } = await supabase
                  .from('profiles')
                  .select('id, name, email, role')
                  .eq('id', property.caretaker_id)
                  .single();

                if (!caretakerError && caretaker) {
                  contacts.push({
                    id: caretaker.id,
                    name: caretaker.name || 'Caretaker',
                    email: caretaker.email || '',
                    role: caretaker.role || 'caretaker',
                    property_title: property.title,
                    property_id: property.id,
                  });
                }
              }
            }
          }
          
        } else if (userRole === 'caretaker') {
          // Get properties assigned to caretaker and their landlords/tenants
          const { data: properties, error: propertiesError } = await supabase
            .from('properties')
            .select(`
              id,
              title,
              landlord_id
            `)
            .eq('caretaker_id', user.id);

          if (!propertiesError && properties) {
            const propertyIds = properties.map(p => p.id);

            // Get landlords for assigned properties
            const landlordIds = [...new Set(properties.map(p => p.landlord_id).filter(Boolean))];
            if (landlordIds.length > 0) {
              const { data: landlords, error: landlordsError } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .in('id', landlordIds);

              if (!landlordsError && landlords) {
                landlords.forEach(landlord => {
                  const landlordProperties = properties.filter(p => p.landlord_id === landlord.id);
                  landlordProperties.forEach(property => {
                    contacts.push({
                      id: landlord.id,
                      name: landlord.name || 'Landlord',
                      email: landlord.email || '',
                      role: landlord.role || 'landlord',
                      property_title: property.title,
                      property_id: property.id,
                    });
                  });
                });
              }
            }

            // Get tenants for assigned properties
            const { data: tenants, error: tenantsError } = await supabase
              .from('leases')
              .select(`
                tenant_id,
                property_id,
                profiles!inner(
                  id,
                  name,
                  email,
                  role
                ),
                properties!inner(
                  id,
                  title
                )
              `)
              .in('property_id', propertyIds)
              .eq('status', 'active');

            if (!tenantsError && tenants) {
              tenants.forEach((lease: any) => {
                if (lease.profiles) {
                  contacts.push({
                    id: lease.profiles.id,
                    name: lease.profiles.name || 'Tenant',
                    email: lease.profiles.email || '',
                    role: lease.profiles.role || 'tenant',
                    property_title: lease.properties?.title,
                    property_id: lease.property_id,
                  });
                }
              });
            }
          }
        }

        // Remove duplicates
        const uniqueContacts = contacts.filter((contact, index, self) => 
          index === self.findIndex(c => c.id === contact.id && c.property_id === contact.property_id)
        );

        return uniqueContacts;

      } catch (error) {
        console.error('Error fetching property contacts:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
