import { app, HttpRequest, HttpResponse, InvocationContext } from "@azure/functions"
import { ReminderService } from "../../services/ReminderService"
import { ValidationError, NotFoundError } from "../../utils/errors"
import { HTTP_STATUS } from "@ai-chat/shared"
import { CreateReminderSchema, UpdateReminderSchema } from "@ai-chat/shared/validation/schemas"

const reminderService = new ReminderService()

export async function getReminders(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    context.log('Getting reminders')
    
    const page = parseInt(request.query.get('page') || '1')
    const limit = parseInt(request.query.get('limit') || '10')
    const status = request.query.get('status') || undefined
    const priority = request.query.get('priority') || undefined
    
    const result = await reminderService.getReminders({ 
      page, 
      limit, 
      status: status as any,
      priority: priority as any
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
    context.error('Error getting reminders:', error)
    
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      jsonBody: {
        success: false,
        error: 'Failed to get reminders'
      }
    }
  }
}

export async function getReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Reminder ID is required')
    }
    
    const reminder = await reminderService.getReminderById(id)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: reminder
      }
    }
  } catch (error) {
    context.error('Error getting reminder:', error)
    
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
        error: 'Failed to get reminder'
      }
    }
  }
}

export async function createReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = CreateReminderSchema.safeParse(body)
    if (!validationResult.success) {
      throw new ValidationError('Invalid request body: ' + validationResult.error.message)
    }
    
    const reminder = await reminderService.createReminder(validationResult.data)
    
    return {
      status: HTTP_STATUS.CREATED,
      jsonBody: {
        success: true,
        data: reminder
      }
    }
  } catch (error) {
    context.error('Error creating reminder:', error)
    
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
        error: 'Failed to create reminder'
      }
    }
  }
}

export async function updateReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Reminder ID is required')
    }
    
    const body = await request.json()
    
    // Validate request body
    const validationResult = UpdateReminderSchema.safeParse(body)
    if (!validationResult.success) {
      throw new ValidationError('Invalid request body: ' + validationResult.error.message)
    }
    
    const reminder = await reminderService.updateReminder(id, validationResult.data)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: reminder
      }
    }
  } catch (error) {
    context.error('Error updating reminder:', error)
    
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
        error: 'Failed to update reminder'
      }
    }
  }
}

export async function deleteReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Reminder ID is required')
    }
    
    await reminderService.deleteReminder(id)
    
    return {
      status: HTTP_STATUS.NO_CONTENT,
      jsonBody: {
        success: true
      }
    }
  } catch (error) {
    context.error('Error deleting reminder:', error)
    
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
        error: 'Failed to delete reminder'
      }
    }
  }
}

export async function snoozeReminder(request: HttpRequest, context: InvocationContext): Promise<HttpResponse> {
  try {
    const id = request.params.id
    
    if (!id) {
      throw new ValidationError('Reminder ID is required')
    }
    
    const body = await request.json()
    const { minutes } = body
    
    if (!minutes || typeof minutes !== 'number') {
      throw new ValidationError('Snooze minutes is required and must be a number')
    }
    
    const reminder = await reminderService.snoozeReminder(id, minutes)
    
    return {
      status: HTTP_STATUS.OK,
      jsonBody: {
        success: true,
        data: reminder
      }
    }
  } catch (error) {
    context.error('Error snoozing reminder:', error)
    
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
        error: 'Failed to snooze reminder'
      }
    }
  }
}

// Azure Functions app registration
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

app.http('snoozeReminder', {
  methods: ['POST'],
  route: 'reminders/{id}/snooze',
  authLevel: 'anonymous',
  handler: snoozeReminder
})
