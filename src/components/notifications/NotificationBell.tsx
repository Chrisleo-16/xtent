
import React, { useState } from 'react';
import { Bell, BellDot, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  variant?: 'sidebar' | 'header';
  className?: string;
}

const NotificationBell = ({ variant = 'header', className = '' }: NotificationBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    return notification.type === activeTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application': return '👤';
      case 'message': return '💬';
      case 'maintenance': return '🔧';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application': return 'border-l-blue-500';
      case 'message': return 'border-l-green-500';
      case 'maintenance': return 'border-l-orange-500';
      case 'system': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'sidebar' ? 'default' : 'icon'}
          className={`relative ${variant === 'sidebar' ? 'w-full justify-start' : ''} ${className}`}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            {unreadCount > 0 ? (
              <BellDot className="h-5 w-5 text-orange-600" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center"
              >
                <span className="text-xs text-white font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </motion.div>
            )}
          </motion.div>
          {variant === 'sidebar' && (
            <span className="ml-3 text-sm font-medium">Notifications</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl" 
        align={variant === 'sidebar' ? 'start' : 'end'}
        side={variant === 'sidebar' ? 'right' : 'bottom'}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Notifications
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 mx-4 mb-4 rounded-xl">
                <TabsTrigger value="all" className="text-xs rounded-lg">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs rounded-lg">Unread</TabsTrigger>
                <TabsTrigger value="message" className="text-xs rounded-lg">Messages</TabsTrigger>
                <TabsTrigger value="maintenance" className="text-xs rounded-lg">Issues</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-80 px-4">
                <TabsContent value={activeTab} className="mt-0 space-y-2">
                  <AnimatePresence>
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group p-3 rounded-xl border-l-4 transition-all duration-300 cursor-pointer ${
                            notification.is_read 
                              ? 'bg-gray-50/50 hover:bg-gray-100/50' 
                              : 'bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 shadow-md'
                          } ${getNotificationColor(notification.type)}`}
                          onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-semibold truncate ${
                                  notification.is_read ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className={`text-xs mb-2 line-clamp-2 ${
                                notification.is_read ? 'text-gray-500' : 'text-gray-600'
                              }`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                                </span>
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <div className="text-4xl mb-3">🔔</div>
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
