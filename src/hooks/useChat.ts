
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatThread {
  id: string;
  property_id?: string;
  landlord_id: string;
  tenant_id: string;
  subject?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  properties?: { title: string };
  profiles?: { name: string; email: string };
  tenant?: { name: string; email: string };
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  property_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: { name: string; email: string };
}

export const useChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all communications as threads for now
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['chat-threads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Use existing communications table as a fallback
      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          property_id,
          sender:profiles!communications_sender_id_fkey(name, email),
          recipient:profiles!communications_recipient_id_fkey(name, email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform communications to thread-like structure
      const threadMap = new Map();
      data?.forEach(comm => {
        const otherId = comm.sender_id === user.id ? comm.recipient_id : comm.sender_id;
        const key = `${comm.property_id || 'general'}_${otherId}`;
        
        if (!threadMap.has(key)) {
          threadMap.set(key, {
            id: key,
            property_id: comm.property_id,
            landlord_id: comm.sender_id,
            tenant_id: comm.recipient_id,
            subject: comm.subject || 'Property Inquiry',
            last_message_at: comm.created_at,
            created_at: comm.created_at,
            updated_at: comm.created_at,
            properties: null,
            profiles: comm.sender_id === user.id ? comm.recipient : comm.sender
          });
        }
      });
      
      return Array.from(threadMap.values());
    },
    enabled: !!user?.id
  });

  // Get messages for a specific thread using communications
  const useThreadMessages = (threadId: string) => {
    return useQuery({
      queryKey: ['thread-messages', threadId],
      queryFn: async () => {
        if (!threadId || !user?.id) return [];
        
        // Extract other user ID from thread ID
        const parts = threadId.split('_');
        const otherId = parts[parts.length - 1];
        
        const { data, error } = await supabase
          .from('communications')
          .select(`
            *,
            sender:profiles!communications_sender_id_fkey(name, email)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Transform to Message format
        return data?.map(comm => ({
          id: comm.id,
          thread_id: threadId,
          sender_id: comm.sender_id,
          recipient_id: comm.recipient_id,
          content: comm.message,
          message_type: comm.type || 'text',
          property_id: comm.property_id,
          is_read: comm.is_read,
          created_at: comm.created_at,
          updated_at: comm.created_at,
          sender: comm.sender
        })) || [];
      },
      enabled: !!threadId && !!user?.id
    });
  };

  // Create or get existing thread using communications
  const createOrGetThread = useMutation({
    mutationFn: async ({ propertyId, landlordId, tenantId, subject }: {
      propertyId?: string;
      landlordId: string;
      tenantId: string;
      subject?: string;
    }) => {
      // Return a synthetic thread ID
      const threadId = `${propertyId || 'general'}_${landlordId === user?.id ? tenantId : landlordId}`;
      return { id: threadId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-threads'] });
    }
  });

  // Send message using communications table
  const sendMessage = useMutation({
    mutationFn: async ({ threadId, recipientId, content, propertyId }: {
      threadId: string;
      recipientId: string;
      content: string;
      propertyId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('communications')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message: content,
          property_id: propertyId,
          type: 'message'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat-threads'] });
    }
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async ({ threadId }: { threadId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Extract other user ID from thread ID
      const parts = threadId.split('_');
      const otherId = parts[parts.length - 1];

      const { error } = await supabase
        .from('communications')
        .update({ is_read: true })
        .eq('sender_id', otherId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['thread-messages', variables.threadId] });
    }
  });

  return {
    threads,
    threadsLoading,
    useThreadMessages,
    createOrGetThread,
    sendMessage,
    markAsRead
  };
};
