import { app, HttpRequest, HttpResponse, InvocationContext } from "@azure/functions"
import { ConversationService } from "../../services/ConversationService"
import { ValidationError, NotFoundError } from "../../utils/errors"
import { HTTP_STATUS } from "@ai-chat/shared"

const conversationService = new ConversationService()

export async function getConversations(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    context.log('Getting conversations')
    
    const page = parseInt(request.query.get('page') || '1')
    const limit = parseInt(request.query.get('limit') || '10')
    const search = request.query.get('search') || undefined
    
    const result = await conversationService.getConversations({ page, limit, search })
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: result.data,
        pagination: result.pagination
      }
    }
  } catch (error) {
    context.error('Error getting conversations:', error)
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to get conversations'
      }
    }
  }
}

export async function getConversation(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Conversation ID is required')
    }
    
    const conversation = await conversationService.getConversationById(id)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: conversation
      }
    }
  } catch (error) {
    context.error('Error getting conversation:', error)
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to get conversation'
      }
    }
  }
}

export async function createConversation(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const body = await request.json()
    
    if (!body || !body.title) {
      throw new ValidationError('Title is required')
    }
    
    const conversation = await conversationService.createConversation(body)
    
    return {
      status: HTTP_STATUS.CREATED,
      jsonBody: {
        success: true,
        data: conversation
      }
    }
  } catch (error) {
    context.error('Error creating conversation:', error)
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to create conversation'
      }
    }
  }
}

export async function updateConversation(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    const body = await request.json()
    
    if (!id) {
      throw new ValidationError('Conversation ID is required')
    }
    
    const conversation = await conversationService.updateConversation(id, body)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: conversation
      }
    }
  } catch (error) {
    context.error('Error updating conversation:', error)
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to update conversation'
      }
    }
  }
}

export async function deleteConversation(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Conversation ID is required')
    }
    
    await conversationService.deleteConversation(id)
    
    return {
      status: HTTP_STATUS.NO_CONTENT,
      jsonBody: {
        success: true
      }
    }
  } catch (error) {
    context.error('Error deleting conversation:', error)
    
    if (error instanceof NotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    if (error instanceof ValidationError) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        jsonBody: {
          success: false,
          error: error.message
        }
      }
    }
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to delete conversation'
      }
    }
  }
}

// Register the functions
app.http('getConversations', {
  methods: ['GET'],
  route: 'conversations',
  authLevel: 'anonymous',
  handler: getConversations
})

app.http('getConversation', {
  methods: ['GET'],
  route: 'conversations/{id}',
  authLevel: 'anonymous',
  handler: getConversation
})

app.http('createConversation', {
  methods: ['POST'],
  route: 'conversations',
  authLevel: 'anonymous',
  handler: createConversation
})

app.http('updateConversation', {
  methods: ['PUT'],
  route: 'conversations/{id}',
  authLevel: 'anonymous',
  handler: updateConversation
})

app.http('deleteConversation', {
  methods: ['DELETE'],
  route: 'conversations/{id}',
  authLevel: 'anonymous',
  handler: deleteConversation
})
