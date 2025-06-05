import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock AI response generator
const generateMockAIResponse = (userMessage: string): string => {
  const responses = [
    'それは興味深い質問ですね。詳しく教えていただけますか？',
    'なるほど、よく理解できました。他にも何かお聞きしたいことはありますか？',
    'そのアプローチは良いアイデアだと思います。具体的にはどのように進めますか？',
    'とても良い観点ですね。別の視点から考えてみると...',
    'それについてもう少し詳しく説明していただけますか？',
    'その問題を解決するためのいくつかの方法を提案できます。',
    'とても興味深いトピックですね。関連する情報をお教えします。'
  ];
  
  // Simple response selection based on message content
  if (userMessage.includes('?') || userMessage.includes('？')) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (userMessage.includes('こんにちは') || userMessage.includes('はじめまして')) {
    return 'こんにちは！今日はどのようなことをお手伝いできますか？';
  }
  
  if (userMessage.includes('ありがとう')) {
    return 'どういたしまして！他にも何かお手伝いできることがあれば、お気軽にお声かけください。';
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// POST /api/chat/stream - Handle chat messages
router.post('/stream', (req, res) => {
  console.log('💬 Processing chat message...');
  
  const { message, conversationId, model = 'gpt-4' } = req.body;
  
  if (!message) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Message content is required'
    });
  }
  
  // Simulate AI processing delay
  setTimeout(() => {
    const aiResponse = generateMockAIResponse(message);
    const messageId = uuidv4();
    const now = new Date().toISOString();
    
    const response = {
      id: messageId,
      role: 'assistant',
      content: aiResponse,
      model: model,
      conversationId: conversationId || uuidv4(),
      timestamp: now,
      usage: {
        prompt_tokens: message.length,
        completion_tokens: aiResponse.length,
        total_tokens: message.length + aiResponse.length
      }
    };
    
    console.log(`✅ AI response generated for conversation: ${response.conversationId}`);
    
    res.json({
      message: response,
      success: true
    });
  }, 500 + Math.random() * 1000); // Random delay 500-1500ms for realism
});

// POST /api/chat/models - Get available AI models
router.get('/models', (req, res) => {
  console.log('🤖 Fetching available AI models...');
  
  const models = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: '最新の高性能大規模言語モデル',
      available: true
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI', 
      description: '高速で効率的な言語モデル',
      available: true
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      description: 'バランスの取れた高性能モデル',
      available: true
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: '高速レスポンス特化モデル',
      available: true
    }
  ];
  
  res.json({
    models,
    default: 'gpt-4'
  });
});

export { router as chatRouter };
