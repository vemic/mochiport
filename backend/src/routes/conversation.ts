import express from 'express';
import { authenticateRequest, getUserId } from '../middleware/auth.js';
import { HTTP_STATUS } from '@mochiport/shared';
import { ConversationService } from '../services/ConversationService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const router = express.Router();
const conversationService = new ConversationService(true); // Use mock AI

// GET /api/conversations - Get all conversations
router.get('/', authenticateRequest, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log('📋 Fetching conversations for user:', userId);
    
    const conversations = await conversationService.getConversations(userId);    res.json({
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        status: conv.status,
        messageCount: conv.messageCount,
        lastMessage: conv.lastMessage ? {
          content: conv.lastMessage.content,
          role: conv.lastMessage.role,
          timestamp: new Date(conv.lastMessage.timestamp)
        } : undefined,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        metadata: {}
      })),
      total: conversations.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch conversations'
    });
  }
});

// POST /api/conversations - Create new conversation
router.post('/', authenticateRequest, async (req, res) => {
  try {
    const { title, initialMessage } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log('📝 Creating new conversation for user:', userId);
    
    const conversation = await conversationService.createConversation(
      {
        title: title || '新しい会話',
        initialMessage
      },
      userId
    );
    
    res.status(HTTP_STATUS.CREATED).json({
      conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    if (error instanceof ValidationError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: error.message
      });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create conversation'
    });
  }
});

// GET /api/conversations/:id - Get specific conversation
router.get('/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log(`🔍 Fetching conversation: ${id} for user: ${userId}`);
    
    const conversation = await conversationService.getConversation(id, userId);
    
    if (!conversation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Conversation not found',
        message: `Conversation with id ${id} not found`
      });
    }
    
    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch conversation'
    });
  }
});

// PUT /api/conversations/:id - Update conversation
router.put('/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log(`📝 Updating conversation: ${id} for user: ${userId}`);
    
    const conversation = await conversationService.updateConversation(id, { title }, userId);
    
    if (!conversation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Conversation not found',
        message: `Conversation with id ${id} not found or access denied`
      });
    }
    
    res.json({
      conversation,
      message: 'Conversation updated successfully'
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    if (error instanceof ValidationError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: error.message
      });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update conversation'
    });
  }
});

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log(`🗑️ Deleting conversation: ${id} for user: ${userId}`);
    
    const success = await conversationService.deleteConversation(id, userId);
    
    if (!success) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Conversation not found',
        message: `Conversation with id ${id} not found or access denied`
      });
    }
    
    res.json({
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete conversation'
    });
  }
});

// POST /api/conversations/:id/messages - Add message to conversation
router.post('/:id/messages', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, role } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log(`📨 Adding message to conversation: ${id} for user: ${userId}`);
    
    const message = await conversationService.addMessage(id, content, role || 'user', userId);
    
    res.status(HTTP_STATUS.CREATED).json({
      message,
      success: true
    });
  } catch (error) {
    console.error('Error adding message:', error);
    if (error instanceof ValidationError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: error.message
      });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to add message'
    });
  }
});

// POST /api/conversations/:id/ai-response - Generate AI response
router.post('/:id/ai-response', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User not authenticated'
      });
    }

    console.log(`🤖 Generating AI response for conversation: ${id} for user: ${userId}`);
    
    const aiMessage = await conversationService.generateAIResponse(id, userId);
    
    res.status(HTTP_STATUS.CREATED).json({
      message: aiMessage,
      success: true
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    if (error instanceof NotFoundError) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: error.message
      });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to generate AI response'
    });
  }
});

export { router as conversationRouter };
