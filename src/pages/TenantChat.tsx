
import { useState } from 'react';
import { ChatThreadList } from '@/components/chat/ChatThreadList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatThread } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

const TenantChat = () => {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);

  const handleSelectThread = (thread: ChatThread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    setSelectedThread(null);
  };

  if (selectedThread) {
    const isLandlord = selectedThread.landlord_id === user?.id;
    const recipientId = isLandlord ? selectedThread.tenant_id : selectedThread.landlord_id;
    const threadTitle = selectedThread.properties?.title || 'Property Inquiry';

    return (
      <div className="h-[calc(100vh-8rem)]">
        <ChatInterface
          threadId={selectedThread.id}
          threadTitle={threadTitle}
          recipientId={recipientId}
          propertyId={selectedThread.property_id}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800 mb-2">Messages</h1>
        <p className="text-gray-600">
          Communicate with landlords and tenants about your properties
        </p>
      </div>
      
      <ChatThreadList onSelectThread={handleSelectThread} />
    </div>
  );
};

export default TenantChat;
