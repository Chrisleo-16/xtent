
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Home } from 'lucide-react';
import { useChat, ChatThread } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ChatThreadListProps {
  onSelectThread: (thread: ChatThread) => void;
}

export const ChatThreadList = ({ onSelectThread }: ChatThreadListProps) => {
  const { user } = useAuth();
  const { threads, threadsLoading } = useChat();

  if (threadsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start a conversation with a landlord or tenant
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {threads.map((thread) => {
            const isLandlord = thread.landlord_id === user?.id;
            const otherUser = thread.profiles || { name: 'Unknown User', email: '' };

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {otherUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {otherUser?.name || otherUser?.email || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(thread.last_message_at), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    {thread.property_id && (
                      <div className="flex items-center gap-1 mb-1">
                        <Home className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600 truncate">
                          Property Discussion
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {thread.subject || 'Property Inquiry'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {isLandlord ? 'Tenant' : 'Landlord'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
