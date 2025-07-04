
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
  action_url?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData = data?.map(notification => ({
        id: notification.id,
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        is_read: notification.is_read,
        type: notification.type,
        created_at: notification.created_at,
        action_url: notification.action_url
      })) || [];

      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up real-time subscription
  const { addListener } = useRealtimeSubscription({
    channelName: user ? `notifications-${user.id}` : '',
    enabled: !!user,
    onSubscriptionChange: (status) => {
      console.log('Notifications subscription status:', status);
    }
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      addListener(
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              title: payload.new.title,
              message: payload.new.message,
              is_read: payload.new.is_read,
              type: payload.new.type,
              created_at: payload.new.created_at,
              action_url: payload.new.action_url
            };
            setNotifications(prev => [newNotification, ...prev]);
            if (!newNotification.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              title: payload.new.title,
              message: payload.new.message,
              is_read: payload.new.is_read,
              type: payload.new.type,
              created_at: payload.new.created_at,
              action_url: payload.new.action_url
            };
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          }
        }
      );
    }
  }, [user?.id, addListener]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
