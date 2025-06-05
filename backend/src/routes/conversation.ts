import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock conversation storage
let conversations: any[] = [
  {
    id: 'conv-1',
    title: 'AI助手との会話例',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'こんにちは！',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg-2', 
        role: 'assistant',
        content: 'こんにちは！何かお手伝いできることはありますか？',
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/conversations - Get all conversations
router.get('/', (req, res) => {
  console.log('📋 Fetching conversations...');
  res.json({
    conversations: conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      messageCount: conv.messages.length,
      lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    })),
    total: conversations.length
  });
});

// POST /api/conversations - Create new conversation
router.post('/', (req, res) => {
  console.log('📝 Creating new conversation...');
  
  const { title, initialMessage } = req.body;
  const conversationId = uuidv4();
  const now = new Date().toISOString();
  
  const newConversation = {
    id: conversationId,
    title: title || '新しい会話',
    messages: initialMessage ? [{
      id: uuidv4(),
      role: 'user',
      content: initialMessage,
      timestamp: now
    }] : [],
    createdAt: now,
    updatedAt: now
  };
  
  conversations.unshift(newConversation);
  
  res.status(201).json({
    conversation: newConversation,
    message: 'Conversation created successfully'
  });
});

// GET /api/conversations/:id - Get specific conversation
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Fetching conversation: ${id}`);
  
  const conversation = conversations.find(conv => conv.id === id);
  
  if (!conversation) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Conversation with id ${id} not found`
    });
  }
  
  res.json({ conversation });
});

// PUT /api/conversations/:id - Update conversation
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, messages } = req.body;
  
  console.log(`📝 Updating conversation: ${id}`);
  
  const conversationIndex = conversations.findIndex(conv => conv.id === id);
  
  if (conversationIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Conversation with id ${id} not found`
    });
  }
  
  if (title) conversations[conversationIndex].title = title;
  if (messages) conversations[conversationIndex].messages = messages;
  conversations[conversationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    conversation: conversations[conversationIndex],
    message: 'Conversation updated successfully'
  });
});

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting conversation: ${id}`);
  
  const conversationIndex = conversations.findIndex(conv => conv.id === id);
  
  if (conversationIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Conversation with id ${id} not found`
    });
  }
  
  conversations.splice(conversationIndex, 1);
  
  res.json({
    message: 'Conversation deleted successfully'
  });
});

export { router as conversationRouter };
