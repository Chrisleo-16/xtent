
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotificationList } from './NotificationList';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Fetch notifications for the current user
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);
      
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up real-time notifications
  useEffect(() => {
    if (!user?.id || isSubscribedRef.current) {
      return;
    }

    console.log('Setting up notification real-time subscription for user:', user.id);
    
    // Create unique channel name
    const channelName = `notifications-${user.id}-${Date.now()}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('New notification received:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted' && payload.new) {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/favicon.ico'
            });
          }
        }
      );

    // Subscribe only once
    isSubscribedRef.current = true;
    channelRef.current.subscribe((status: string) => {
      console.log('Notification channel subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('Notification real-time updates connected');
      } else if (status === 'CLOSED') {
        console.log('Notification real-time updates disconnected');
        isSubscribedRef.current = false;
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Notification real-time subscription error');
        isSubscribedRef.current = false;
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up notification channel subscription');
      
      if (channelRef.current && isSubscribedRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, queryClient]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications && notifications.length > 0 ? (
            <NotificationList 
              notifications={notifications} 
              onMarkAsRead={markAsRead}
            />
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
