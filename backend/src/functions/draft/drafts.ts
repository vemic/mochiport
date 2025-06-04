import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { DraftService } from '../../services/DraftService'
import type { DraftFilters, CreateDraftData, UpdateDraftData } from '@ai-chat/shared'

const draftService = new DraftService()

export async function getDrafts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const filters: DraftFilters = {
      page: Number(request.query.get('page')) || 1,
      limit: Number(request.query.get('limit')) || 10,
      status: request.query.get('status') as any,
      type: request.query.get('type') as any,
      conversationId: request.query.get('conversationId') || undefined,
      title: request.query.get('title') || undefined,
      content: request.query.get('content') || undefined
    }

    const result = await draftService.findMany(filters)

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    }
  } catch (error) {
    context.error('Error getting drafts:', error)
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

export async function getDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Draft ID is required',
          timestamp: new Date().toISOString()
        })
      }
    }

    const draft = await draftService.findById(id)
    if (!draft) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Draft not found',
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: draft,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error getting draft:', error)
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

export async function createDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.text()
    const data: CreateDraftData = JSON.parse(body)

    const draft = await draftService.create(data)

    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: draft,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error creating draft:', error)
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

export async function updateDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Draft ID is required',
          timestamp: new Date().toISOString()
        })
      }
    }

    const body = await request.text()
    const data: UpdateDraftData = JSON.parse(body)

    const draft = await draftService.update(id, data)
    if (!draft) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Draft not found',
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: draft,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error updating draft:', error)
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

export async function deleteDraft(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Draft ID is required',
          timestamp: new Date().toISOString()
        })
      }
    }

    await draftService.delete(id)

    return {
      status: 204,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error deleting draft:', error)
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Register Azure Functions
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