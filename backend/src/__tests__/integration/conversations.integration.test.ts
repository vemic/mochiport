import { ConversationService } from '../../services/ConversationService';
import { ReminderService } from '../../services/ReminderService';
import { ConversationRepository } from '../../repositories/ConversationRepository';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { authenticateRequest, authorizeRequest } from '../../middleware/auth';
import { mockConversations } from '../../data/mock-data';
import { InvocationContext } from '@azure/functions';

describe('Conversations Integration Tests', () => {
  let conversationService: ConversationService;
  let reminderService: ReminderService;

  const mockContext = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  } as unknown as InvocationContext;

  beforeEach(() => {
    conversationService = new ConversationService(true); // Use mock AI
    reminderService = new ReminderService();
  });

  describe('End-to-End Conversation Flow', () => {
    it('should create a conversation and add messages', async () => {
      const newConversation = await conversationService.createConversation({
        title: 'Integration Test Conversation'
      });

      expect(newConversation).toBeDefined();
      expect(newConversation.title).toBe('Integration Test Conversation');
      expect(newConversation.messages).toEqual([]);
      expect(newConversation.status).toBe('active');

      // Add a message to the conversation
      const messageData = {
        role: 'user' as const,
        content: 'Hello, this is a test message'
      };

      const updatedConversation = await conversationService.addMessage(
        newConversation.id,
        messageData
      );

      expect(updatedConversation.messages).toHaveLength(1);
      expect(updatedConversation.messages[0].content).toBe('Hello, this is a test message');
      expect(updatedConversation.messages[0].role).toBe('user');
    });

    it('should handle conversation lifecycle (create, update, delete)', async () => {
      // Create
      const conversation = await conversationService.createConversation({
        title: 'Lifecycle Test'
      });

      expect(conversation.title).toBe('Lifecycle Test');

      // Update
      const updatedConversation = await conversationService.updateConversation(
        conversation.id,
        { title: 'Updated Lifecycle Test' }
      );

      expect(updatedConversation.title).toBe('Updated Lifecycle Test');

      // Delete
      await conversationService.deleteConversation(conversation.id);

      // Verify deletion
      await expect(
        conversationService.getConversationById(conversation.id)
      ).rejects.toThrow('Conversation not found');
    });

    it('should generate AI responses and maintain conversation context', async () => {
      const conversation = mockConversations[0]; // Use existing conversation
      
      const aiResponse = await conversationService.generateAIResponse(
        conversation.id
      );

      expect(aiResponse).toBeDefined();
      expect(aiResponse.messages).toHaveLength(conversation.messages.length + 1); // AI response added
      
      // Check that AI response was added
      const aiMessage = aiResponse.messages[aiResponse.messages.length - 1];
      expect(aiMessage.role).toBe('assistant');
      expect(aiMessage.content).toBeDefined();
    });
  });

  describe('Authentication Integration', () => {
    it('should authenticate users with valid tokens', async () => {
      const mockRequest = {
        headers: new Map([
          ['authorization', 'Bearer dev-mock-token']
        ])
      } as any;

      const result = await authenticateRequest(mockRequest, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.userId).toBe('dev-user-123');
      expect(result.user?.email).toBe('dev@example.com');
    });

    it('should authorize users with correct roles', async () => {
      const mockRequest = {
        headers: new Map([
          ['authorization', 'Bearer dev-mock-token']
        ]),
        user: {
          userId: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Development User',
          roles: ['admin', 'user']
        }
      } as any;

      const result = await authorizeRequest(mockRequest, mockContext, ['admin']);
      
      expect(result.success).toBe(true);
    });

    it('should reject unauthorized access', async () => {
      const mockRequest = {
        headers: new Map([
          ['authorization', 'Bearer dev-mock-token']
        ]),
        user: {
          userId: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Development User',
          roles: ['user'] // No admin role
        }
      } as any;

      const result = await authorizeRequest(mockRequest, mockContext, ['admin']);
      
      expect(result.success).toBe(false);
    });
  });

  describe('Cross-Service Integration', () => {
    it('should work with reminder service integration', async () => {
      // Create a conversation
      const conversation = await conversationService.createConversation({
        title: 'Reminder Integration Test'
      });      // Create a reminder related to the conversation
      const reminder = await reminderService.createReminder({
        conversationId: conversation.id,
        title: 'Review conversation',
        description: `Review conversation: ${conversation.title}`,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        type: 'task',
        metadata: {
          priority: 'medium'
        }
      });

      expect(reminder.description).toContain(conversation.title);

      // Verify both services can retrieve their data
      const retrievedConversation = await conversationService.getConversationById(conversation.id);
      const retrievedReminders = await reminderService.getReminders({ limit: 10 });

      expect(retrievedConversation.id).toBe(conversation.id);
      expect(retrievedReminders.data).toContainEqual(
        expect.objectContaining({ id: reminder.id })
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cascading errors gracefully', async () => {
      // Try to add message to non-existent conversation
      await expect(
        conversationService.addMessage('non-existent-id', {
          role: 'user',
          content: 'This should fail'
        })
      ).rejects.toThrow('Conversation not found');

      // Try to generate AI response for non-existent conversation
      await expect(
        conversationService.generateAIResponse('non-existent-id')
      ).rejects.toThrow('Conversation not found');
    });

    it('should maintain data consistency during errors', async () => {
      const initialConversations = await conversationService.getConversations({ limit: 10 });
      const initialCount = initialConversations.data.length;

      // Try to create invalid conversation (this should fail if validation exists)
      try {
        await conversationService.createConversation({
          title: '' // Empty title should fail validation
        });
      } catch (error) {
        // Error is expected for invalid data
        expect(error).toBeDefined();
      }

      // Verify no partial data was created
      const finalConversations = await conversationService.getConversations({ limit: 10 });
      expect(finalConversations.data.length).toBe(initialCount);
    });
  });

  describe('Service Interaction Tests', () => {
    it('should handle message flow between services', async () => {
      // Create conversation
      const conversation = await conversationService.createConversation({
        title: 'Message Flow Test'
      });

      // Add user message
      const conversationWithUserMessage = await conversationService.addMessage(
        conversation.id,
        {
          role: 'user',
          content: 'How can I improve my productivity?'
        }
      );

      expect(conversationWithUserMessage.messages).toHaveLength(1);
      expect(conversationWithUserMessage.messages[0].role).toBe('user');

      // Generate AI response
      const conversationWithAIResponse = await conversationService.generateAIResponse(
        conversation.id
      );

      expect(conversationWithAIResponse.messages).toHaveLength(2);
      expect(conversationWithAIResponse.messages[1].role).toBe('assistant');      // Create reminder based on conversation
      const reminder = await reminderService.createReminder({
        conversationId: conversation.id,
        title: 'Follow up on productivity tips',
        description: `Follow up on the conversation: ${conversation.title}`,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
        type: 'task',
        metadata: {
          priority: 'medium'
        }
      });

      expect(reminder.title).toBe('Follow up on productivity tips');
      expect(reminder.description).toContain(conversation.title);
    });

    it('should handle complex conversation scenarios', async () => {
      // Create multiple conversations
      const conversations = await Promise.all([
        conversationService.createConversation({ title: 'Test 1' }),
        conversationService.createConversation({ title: 'Test 2' }),
        conversationService.createConversation({ title: 'Test 3' })
      ]);

      expect(conversations).toHaveLength(3);

      // Add messages to each
      for (const conv of conversations) {
        await conversationService.addMessage(conv.id, {
          role: 'user',
          content: `Message for ${conv.title}`
        });
      }

      // Retrieve all conversations
      const allConversations = await conversationService.getConversations({ 
        limit: 10 
      });

      expect(allConversations.data.length).toBeGreaterThanOrEqual(3);

      // Verify each conversation has its message
      for (const conv of conversations) {
        const retrievedConv = await conversationService.getConversationById(conv.id);
        expect(retrievedConv.messages).toHaveLength(1);
        expect(retrievedConv.messages[0].content).toContain(conv.title);
      }
    });
  });
});