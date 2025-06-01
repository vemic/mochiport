import { ChatContainer } from '@/features/chat';

export default function ConversationsPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatContainer />
    </div>
  );
}

ConversationsPage.displayName = 'ConversationsPage';
