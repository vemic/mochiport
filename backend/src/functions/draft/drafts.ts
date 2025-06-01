import { app, HttpRequest, HttpResponse, InvocationContext } from "@azure/functions"
import { DraftService } from "../../services/DraftService"
import { ValidationError, NotFoundError } from "../../utils/errors"
import { HTTP_STATUS } from "@ai-chat/shared"
import { CreateDraftSchema, UpdateDraftSchema } from "@ai-chat/shared/validation/schemas"

const draftService = new DraftService()

export async function getDrafts(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    context.log('Getting drafts')
    
    const page = parseInt(request.query.get('page') || '1')
    const limit = parseInt(request.query.get('limit') || '10')
    const status = request.query.get('status') || undefined
    const search = request.query.get('search') || undefined
    
    const result = await draftService.getDrafts({ 
      page, 
      limit, 
      status: status as any,
      search
    })
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: result.data,
        pagination: result.pagination
      }
    }
  } catch (error) {
    context.error('Error getting drafts:', error)
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to get drafts'
      }
    }
  }
}

export async function getDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Draft ID is required')
    }
    
    const draft = await draftService.getDraftById(id)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: draft
      }
    }
  } catch (error) {
    context.error('Error getting draft:', error)
    
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
        error: 'Failed to get draft'
      }
    }
  }
}

export async function createDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = CreateDraftSchema.safeParse(body)
    if (!validationResult.success) {
      throw new ValidationError('Invalid request body: ' + validationResult.error.message)
    }
    
    const draft = await draftService.createDraft(validationResult.data)
    
    return {
      status: HTTP_STATUS.CREATED,
      jsonBody: {
        success: true,
        data: draft
      }
    }
  } catch (error) {
    context.error('Error creating draft:', error)
    
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
        error: 'Failed to create draft'
      }
    }
  }
}

export async function updateDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Draft ID is required')
    }
    
    const body = await request.json()
    
    // Validate request body
    const validationResult = UpdateDraftSchema.safeParse(body)
    if (!validationResult.success) {
      throw new ValidationError('Invalid request body: ' + validationResult.error.message)
    }
    
    const draft = await draftService.updateDraft(id, validationResult.data)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: draft
      }
    }
  } catch (error) {
    context.error('Error updating draft:', error)
    
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
        error: 'Failed to update draft'
      }
    }
  }
}

export async function deleteDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Draft ID is required')
    }
    
    await draftService.deleteDraft(id)
    
    return {
      status: HTTP_STATUS.NO_CONTENT,
      jsonBody: {
        success: true
      }
    }
  } catch (error) {
    context.error('Error deleting draft:', error)
    
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
        error: 'Failed to delete draft'
      }
    }
  }
}

export async function autoSaveDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Draft ID is required')
    }
    
    const body = await request.json()
    const { content } = body
    
    if (typeof content !== 'string') {
      throw new ValidationError('Content is required and must be a string')
    }
    
    const draft = await draftService.autoSaveDraft(id, content)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: draft
      }
    }
  } catch (error) {
    context.error('Error auto-saving draft:', error)
    
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
        error: 'Failed to auto-save draft'
      }
    }
  }
}

export async function publishDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Draft ID is required')
    }
    
    const conversation = await draftService.publishDraft(id)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: conversation
      }
    }
  } catch (error) {
    context.error('Error publishing draft:', error)
    
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
        error: 'Failed to publish draft'
      }
    }
  }
}

// Azure Functions app registration
app.http('getDrafts', {
  methods: ['GET'],
  route: 'drafts',
  authLevel: 'anonymous',
  handler: getDrafts
})

app.http('getDraft', {
  methods: ['GET'],
  route: 'drafts/{id}',
  authLevel: 'anonymous',
  handler: getDraft
})

app.http('createDraft', {
  methods: ['POST'],
  route: 'drafts',
  authLevel: 'anonymous',
  handler: createDraft
})

app.http('updateDraft', {
  methods: ['PUT'],
  route: 'drafts/{id}',
  authLevel: 'anonymous',
  handler: updateDraft
})

app.http('deleteDraft', {
  methods: ['DELETE'],
  route: 'drafts/{id}',
  authLevel: 'anonymous',
  handler: deleteDraft
})

app.http('autoSaveDraft', {
  methods: ['POST'],
  route: 'drafts/{id}/autosave',
  authLevel: 'anonymous',
  handler: autoSaveDraft
})

app.http('publishDraft', {
  methods: ['POST'],
  route: 'drafts/{id}/publish',
  authLevel: 'anonymous',
  handler: publishDraft
})
