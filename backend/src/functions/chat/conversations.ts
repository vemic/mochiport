import { 
  app, 
  HttpRequest, 
  HttpResponseInit, 
  InvocationContext 
} from "@azure/functions";
import { 
  ApiResponse, 
  Conversation, 
  ConversationFilters, 
  CreateConversationData,
  UpdateConversationData, 
  HTTP_STATUS
} from "@ai-chat/shared";
import { ConversationService } from "../../services/ConversationService";
import { NotFoundError, ValidationError } from "../../utils/errors";

// エラーレスポンスインターフェース
interface ApiErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  data?: null; // ApiResponse型との互換性のため
}

const conversationService = new ConversationService(true); // デフォルトでモックAIを使用

/**
 * 会話の一覧を取得する
 */
export async function getConversations(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const query = request.query;
    const filters: ConversationFilters = {
      page: query.get('page') ? parseInt(query.get('page') as string, 10) : 1,
      limit: query.get('limit') ? parseInt(query.get('limit') as string, 10) : 10,
      search: query.get('search') as string || undefined,
      status: query.get('status') as any || undefined
    };

    const conversations = await conversationService.getConversations(filters);
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: conversations.data,
        pagination: conversations.pagination,
        timestamp: new Date().toISOString()
      } as ApiResponse<Conversation[]>
    };
  } catch (error) {
    context.error(`Error in getConversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to get conversations',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

/**
 * 特定のIDの会話を取得する
 */
export async function getConversation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    
    if (!id) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Conversation ID is required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    const conversation = await conversationService.getConversationById(id);
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: conversation,
        timestamp: new Date().toISOString()
      } as ApiResponse<Conversation>
    };
  } catch (error) {
    context.error(`Error in getConversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to get conversation',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

/**
 * 新しい会話を作成する
 */
export async function createConversation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const data = await request.json() as CreateConversationData;
    
    if (!data?.title) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Title is required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    const conversation = await conversationService.createConversation(data);
    
    return {
      status: HTTP_STATUS.CREATED,
      jsonBody: {
        success: true,
        data: conversation,
        timestamp: new Date().toISOString()
      } as ApiResponse<Conversation>
    };
  } catch (error) {
    context.error(`Error in createConversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to create conversation',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

/**
 * 既存の会話を更新する
 */
export async function updateConversation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    
    if (!id) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Conversation ID is required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    const data = await request.json() as UpdateConversationData;
    const conversation = await conversationService.updateConversation(id, data);
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: conversation,
        timestamp: new Date().toISOString()
      } as ApiResponse<Conversation>
    };
  } catch (error) {
    context.error(`Error in updateConversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to update conversation',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

/**
 * 会話を削除する
 */
export async function deleteConversation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    
    if (!id) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Conversation ID is required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    await conversationService.deleteConversation(id);
    
    return {
      status: HTTP_STATUS.NO_CONTENT,
      jsonBody: {
        success: true,
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  } catch (error) {
    context.error(`Error in deleteConversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to delete conversation',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

/**
 * 会話にメッセージを追加する
 */
export async function addMessage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    
    if (!id) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Conversation ID is required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    const body = await request.json() as { content: string; role: string; metadata?: Record<string, unknown> };
    if (!body || !body.content || !body.role) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Message content and role are required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    const message = {
      content: body.content,
      role: body.role as any, // MessageRole型にキャスト
      metadata: body.metadata || {}
    };
    
    const updatedConversation = await conversationService.addMessage(id, message);
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: updatedConversation,
        timestamp: new Date().toISOString()
      } as ApiResponse<Conversation>
    };
  } catch (error) {
    context.error(`Error in addMessage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to add message',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

/**
 * AIの応答を生成する
 */
export async function generateAIResponse(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    
    if (!id) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: 'Conversation ID is required',
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    const updatedConversation = await conversationService.generateAIResponse(id);
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: updatedConversation,
        timestamp: new Date().toISOString()
      } as ApiResponse<Conversation>
    };
  } catch (error) {
    context.error(`Error in generateAIResponse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message,
          data: null,
          timestamp: new Date().toISOString()
        } as ApiResponse<null>
      };
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to generate AI response',
        data: null,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>
    };
  }
}

// HTTP handlers registration
app.http('getConversations', {
  methods: ['GET'],
  route: 'conversations',
  handler: getConversations
});

app.http('getConversation', {
  methods: ['GET'],
  route: 'conversations/{id}',
  handler: getConversation
});

app.http('createConversation', {
  methods: ['POST'],
  route: 'conversations',
  handler: createConversation
});

app.http('updateConversation', {
  methods: ['PUT'],
  route: 'conversations/{id}',
  handler: updateConversation
});

app.http('deleteConversation', {
  methods: ['DELETE'],
  route: 'conversations/{id}',
  handler: deleteConversation
});

app.http('addMessage', {
  methods: ['POST'],
  route: 'conversations/{id}/messages',
  handler: addMessage
});

app.http('generateAIResponse', {
  methods: ['POST'],
  route: 'conversations/{id}/ai-response',
  handler: generateAIResponse
});