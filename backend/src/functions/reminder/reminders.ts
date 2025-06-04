import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { ReminderService } from '../../services/ReminderService'
import type { ReminderFilters, CreateReminderData, UpdateReminderData } from '@ai-chat/shared'

const reminderService = new ReminderService()

export async function getReminders(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const filters: ReminderFilters = {
      page: Number(request.query.get('page')) || 1,
      limit: Number(request.query.get('limit')) || 10,
      status: request.query.get('status') as any,
      priority: request.query.get('priority') as any,
      conversationId: request.query.get('conversationId') || undefined,
      title: request.query.get('title') || undefined,
      description: request.query.get('description') || undefined
    }

    const result = await reminderService.findMany(filters)

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    }
  } catch (error) {
    context.error('Error getting reminders:', error)
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

export async function getReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Reminder ID is required',
          timestamp: new Date().toISOString()
        })
      }
    }

    const reminder = await reminderService.findById(id)
    if (!reminder) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Reminder not found',
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: reminder,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error getting reminder:', error)
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

export async function createReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.text()
    const data: CreateReminderData = JSON.parse(body)

    const reminder = await reminderService.create(data)

    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: reminder,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error creating reminder:', error)
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

export async function updateReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Reminder ID is required',
          timestamp: new Date().toISOString()
        })
      }
    }

    const body = await request.text()
    const data: UpdateReminderData = JSON.parse(body)

    const reminder = await reminderService.update(id, data)
    if (!reminder) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Reminder not found',
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: reminder,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error updating reminder:', error)
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

export async function deleteReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    if (!id) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Reminder ID is required',
          timestamp: new Date().toISOString()
        })
      }
    }

    await reminderService.delete(id)

    return {
      status: 204,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    context.error('Error deleting reminder:', error)
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
app.http('getReminders', {
  methods: ['GET'],
  route: 'reminders',
  authLevel: 'anonymous',
  handler: getReminders
})

app.http('getReminder', {
  methods: ['GET'],
  route: 'reminders/{id}',
  authLevel: 'anonymous',
  handler: getReminder
})

app.http('createReminder', {
  methods: ['POST'],
  route: 'reminders',
  authLevel: 'anonymous',
  handler: createReminder
})

app.http('updateReminder', {
  methods: ['PUT'],
  route: 'reminders/{id}',
  authLevel: 'anonymous',
  handler: updateReminder
})

app.http('deleteReminder', {
  methods: ['DELETE'],
  route: 'reminders/{id}',
  authLevel: 'anonymous',
  handler: deleteReminder
})