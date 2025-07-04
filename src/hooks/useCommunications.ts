
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export interface CommunicationWithDetails extends Tables<'communications'> {
  sender?: {
    name: string;
    email: string;
    role: string;
  };
  recipient?: {
    name: string;
    email: string;
    role: string;
  };
  property?: {
    title: string;
    address: string;
  };
}

export const useCommunications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['communications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          sender:profiles!communications_sender_id_fkey(name, email, role),
          recipient:profiles!communications_recipient_id_fkey(name, email, role),
          property:properties(title, address)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching communications:', error);
        throw new Error('Failed to fetch communications');
      }

      return data as CommunicationWithDetails[];
    },
    enabled: !!user,
  });
};

export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const userRole = user?.user_metadata?.role || 'tenant';

      // Get all potential contacts based on user role
      let contactsQuery;
      
      if (userRole === 'landlord') {
        // Landlords can chat with tenants and caretakers
        contactsQuery = supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('role', ['tenant', 'caretaker']);
      } else if (userRole === 'tenant') {
        // Tenants can chat with their landlords and caretakers of their properties
        contactsQuery = supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('role', ['landlord', 'caretaker']);
      } else if (userRole === 'caretaker') {
        // Caretakers can chat with landlords and tenants of assigned properties
        const { data: assignedProperties } = await supabase
          .from('properties')
          .select('id, landlord_id')
          .eq('caretaker_id', user.id);

        const propertyIds = assignedProperties?.map(p => p.id) || [];
        const landlordIds = assignedProperties?.map(p => p.landlord_id).filter(Boolean) || [];

        // Get tenants from assigned properties
        const { data: tenantIds } = await supabase
          .from('leases')
          .select('tenant_id')
          .in('property_id', propertyIds)
          .eq('status', 'active');

        const allContactIds = [
          ...landlordIds,
          ...(tenantIds?.map(t => t.tenant_id) || [])
        ].filter(Boolean);

        if (allContactIds.length === 0) {
          return [];
        }

        contactsQuery = supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('id', allContactIds);
      } else {
        // Default to all users for other roles
        contactsQuery = supabase
          .from('profiles')
          .select('id, name, email, role')
          .neq('id', user.id);
      }

      const { data: contacts, error: contactsError } = await contactsQuery;
      
      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return [];
      }

      // Get recent messages for each contact
      const { data: messages, error: messagesError } = await supabase
        .from('communications')
        .select(`
          sender_id,
          recipient_id,
          created_at,
          message,
          is_read
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return [];
      }

      // Build conversations map
      const conversations = new Map();
      
      // Add all potential contacts
      contacts?.forEach((contact: any) => {
        conversations.set(contact.id, {
          id: contact.id,
          name: contact.name || 'Unknown',
          role: contact.role || 'user',
          email: contact.email || '',
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          online: false,
        });
      });

      // Update with actual message data
      messages?.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        
        if (conversations.has(partnerId)) {
          const conv = conversations.get(partnerId);
          
          // Update last message if this is more recent
          if (!conv.lastMessage || new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
            conv.lastMessage = msg.message;
            conv.lastMessageTime = msg.created_at;
          }
          
          // Count unread messages
          if (!msg.is_read && msg.recipient_id === user.id) {
            conv.unreadCount++;
          }
        }
      });

      return Array.from(conversations.values()).sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    },
    enabled: !!user,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (message: Omit<TablesInsert<'communications'>, 'sender_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('communications')
        .insert({
          ...message,
          sender_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('communications')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        throw new Error('Failed to mark message as read');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
