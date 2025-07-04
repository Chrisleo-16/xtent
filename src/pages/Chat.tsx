
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Search, User, Users, Plus, Wrench } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useConversations, useCommunications, useSendMessage, useMarkAsRead } from '@/hooks/useCommunications';
import { useLandlordTenants } from '@/hooks/useLandlordTenants';
import { usePropertyContacts } from '@/hooks/usePropertyContacts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatRecipient, setNewChatRecipient] = useState('');
  const [searchParams] = useSearchParams();

  const { user } = useAuth();
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: communications, isLoading: messagesLoading } = useCommunications();
  const { data: tenants } = useLandlordTenants();
  const { data: propertyContacts } = usePropertyContacts();
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const userRole = user?.user_metadata?.role || 'tenant';

  // Handle URL parameters for direct chat navigation
  useEffect(() => {
    const partnerId = searchParams.get('partner');
    const context = searchParams.get('context');
    const requestId = searchParams.get('request');
    
    if (partnerId) {
      setSelectedChat(partnerId);
      
      // Pre-fill message for maintenance context
      if (context === 'maintenance' && requestId) {
        setMessage(`Regarding maintenance request #${requestId}: `);
      }
    }
  }, [searchParams]);

  // Get all available contacts based on user role
  const getAvailableContacts = () => {
    if (!user) return [];
    
    const contacts = [];
    
    // Add conversations partners
    conversations?.forEach(conv => {
      if (!contacts.find(c => c.id === conv.id)) {
        contacts.push({
          id: conv.id,
          name: conv.name,
          email: conv.email,
          role: conv.role,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount,
          online: conv.online,
        });
      }
    });

    // Add property-related contacts
    propertyContacts?.forEach(contact => {
      if (!contacts.find(c => c.id === contact.id)) {
        contacts.push({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          role: contact.role,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          online: false,
          property_title: contact.property_title,
        });
      }
    });

    // Add tenants for landlords
    if (userRole === 'landlord' && tenants) {
      tenants.forEach(tenant => {
        if (!contacts.find(c => c.id === tenant.id)) {
          contacts.push({
            id: tenant.id,
            name: tenant.name || 'Unknown Tenant',
            email: tenant.email || '',
            role: 'tenant',
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            online: false,
          });
        }
      });
    }

    return contacts;
  };

  const availableContacts = getAvailableContacts();

  // Filter conversations based on search term
  const filteredConversations = availableContacts.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get messages for selected conversation
  const selectedMessages = communications?.filter(msg =>
    (msg.sender_id === selectedChat && msg.recipient_id === user?.id) ||
    (msg.sender_id === user?.id && msg.recipient_id === selectedChat)
  ).sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()) || [];

  const selectedConversation = availableContacts.find(conv => conv.id === selectedChat);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedChat && selectedMessages.length > 0) {
      selectedMessages
        .filter(msg => !msg.is_read && msg.recipient_id === user?.id)
        .forEach(msg => markAsRead.mutate(msg.id));
    }
  }, [selectedChat, selectedMessages, user?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      await sendMessage.mutateAsync({
        recipient_id: selectedChat,
        message: message.trim(),
        type: 'message',
      });
      setMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatRecipient) return;

    try {
      await sendMessage.mutateAsync({
        recipient_id: newChatRecipient,
        message: 'Hello! I\'d like to start a conversation.',
        type: 'message',
      });
      setSelectedChat(newChatRecipient);
      setIsNewChatOpen(false);
      setNewChatRecipient('');
      toast.success('New conversation started');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'landlord': return 'bg-green-100 text-green-700';
      case 'tenant': return 'bg-blue-100 text-blue-700';
      case 'caretaker': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (conversationsLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar role={userRole} />
          <SidebarInset>
            <div className="p-4">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                  <p className="mt-6 text-gray-600 font-medium">Loading conversations...</p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
        <MobileNavigation role={userRole} />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role={userRole} />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            
            {/* Header */}
            <div className="bg-white shadow-sm border-b p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-7 w-7 text-green-600" />
                    Messages
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {userRole === 'landlord' 
                      ? 'Communicate with tenants and staff' 
                      : 'Communicate with your landlord and property team'}
                  </p>
                </div>

                <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Start New Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="recipient">Select Contact</Label>
                        <Select value={newChatRecipient} onValueChange={setNewChatRecipient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a contact" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                <div className="flex items-center gap-2">
                                  <span>{contact.name || contact.email}</span>
                                  <Badge variant="secondary" className={`text-xs ${getRoleColor(contact.role)}`}>
                                    {contact.role}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleStartNewChat}
                          disabled={!newChatRecipient}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Start Chat
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsNewChatOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <div className="w-full md:w-1/3 bg-white border-r">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto">
                  {filteredConversations.length > 0 ? filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedChat(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            {conversation.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm text-gray-900 truncate">
                                {conversation.name}
                              </h3>
                              <Badge variant="secondary" className={`text-xs ${getRoleColor(conversation.role)}`}>
                                {conversation.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{conversation.email}</p>
                            {conversation.property_title && (
                              <p className="text-xs text-gray-500 mb-1">Property: {conversation.property_title}</p>
                            )}
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {conversation.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {format(new Date(conversation.lastMessageTime), 'HH:mm')}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No conversations found</p>
                      <p className="text-sm mt-1">Start a new chat or check back later</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="hidden md:flex flex-1 flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {selectedConversation.name}
                            <Badge variant="secondary" className={`text-xs ${getRoleColor(selectedConversation.role)}`}>
                              {selectedConversation.role}
                            </Badge>
                          </h3>
                          <p className="text-sm text-gray-500">{selectedConversation.email}</p>
                          {selectedConversation.property_title && (
                            <p className="text-sm text-gray-500">Property: {selectedConversation.property_title}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      <div className="space-y-4">
                        {selectedMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.sender_id === user?.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-gray-900 border'
                              }`}
                            >
                              {msg.type === 'maintenance_request' && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Wrench className="h-3 w-3" />
                                  <span className="text-xs opacity-80">Maintenance Request</span>
                                </div>
                              )}
                              {msg.type === 'notice' && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Wrench className="h-3 w-3" />
                                  <span className="text-xs opacity-80">Status Update</span>
                                </div>
                              )}
                              <p className="text-sm">{msg.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                                }`}
                              >
                                {format(new Date(msg.created_at!), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={sendMessage.isPending || !message.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role={userRole} />
    </SidebarProvider>
  );
};

export default Chat;
