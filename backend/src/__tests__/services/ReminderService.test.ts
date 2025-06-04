
import { ReminderService } from '../../services/ReminderService'
import { ReminderRepository } from '../../repositories/ReminderRepository'
import { NotFoundError, ValidationError } from '../../utils/errors'
import { addDays } from 'date-fns'

// Mock the repository
jest.mock('../../repositories/ReminderRepository')

describe('ReminderService', () => {
  let reminderService: ReminderService
  let mockReminderRepository: jest.Mocked<ReminderRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    reminderService = new ReminderService()
    mockReminderRepository = (reminderService as any).reminderRepository
  })

  describe('getReminders', () => {
    it('should return paginated reminders', async () => {
      const mockFilters = { page: 1, limit: 10 }
      const mockResponse = {
        data: [
          {
            id: '1',
            title: 'Test Reminder',
            description: 'Test description',
            dueDate: addDays(new Date(), 1),
            priority: 'high' as const,
            status: 'pending' as const,
            type: 'task' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        pagination: { total: 1, page: 1, limit: 10 }
      }

      mockReminderRepository.findMany.mockResolvedValue(mockResponse)

      const result = await reminderService.getReminders(mockFilters)

      expect(result).toEqual(mockResponse)
      expect(mockReminderRepository.findMany).toHaveBeenCalledWith(mockFilters)
    })

    it('should handle repository errors', async () => {
      const mockFilters = { page: 1, limit: 10 }
      const mockError = new Error('Database error')

      mockReminderRepository.findMany.mockRejectedValue(mockError)

      await expect(reminderService.getReminders(mockFilters)).rejects.toThrow(mockError)
    })
  })

  describe('getReminderById', () => {
    it('should return reminder when found', async () => {
      const mockReminder = {
        id: '1',
        title: 'Test Reminder',
        description: 'Test description',
        dueDate: addDays(new Date(), 1),
        priority: 'high' as const,
        status: 'pending' as const,
        type: 'task' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockReminderRepository.findById.mockResolvedValue(mockReminder)

      const result = await reminderService.getReminderById('1')

      expect(result).toEqual(mockReminder)
      expect(mockReminderRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when reminder not found', async () => {
      mockReminderRepository.findById.mockResolvedValue(null)

      await expect(reminderService.getReminderById('1')).rejects.toThrow(NotFoundError)
      await expect(reminderService.getReminderById('1')).rejects.toThrow('Reminder with ID 1 not found')
    })
  })

  describe('createReminder', () => {
    it('should create reminder with valid data', async () => {
      const mockData = {
        title: 'New Reminder',
        description: 'New description',
        dueDate: addDays(new Date(), 1),
        priority: 'high' as const,
        type: 'task' as const
      }

      const mockCreatedReminder = {
        id: '1',
        ...mockData,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockReminderRepository.create.mockResolvedValue(mockCreatedReminder)

      const result = await reminderService.createReminder(mockData)

      expect(result).toEqual(mockCreatedReminder)
      expect(mockReminderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockData.title,
          description: mockData.description,
          priority: mockData.priority,
          type: mockData.type,
          status: 'pending'
        })
      )
    })

    it('should throw ValidationError when due date is in the past', async () => {
      const mockData = {
        title: 'New Reminder',
        description: 'New description',
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        priority: 'high' as const,
        type: 'task' as const
      }

      await expect(reminderService.createReminder(mockData)).rejects.toThrow(ValidationError)
      await expect(reminderService.createReminder(mockData)).rejects.toThrow('Due date must be in the future')
    })

    it('should set default priority when not provided', async () => {
      const mockData = {
        title: 'New Reminder',
        description: 'New description',
        dueDate: addDays(new Date(), 1),
        type: 'task' as const
      }

      const mockCreatedReminder = {
        id: '1',
        ...mockData,
        priority: 'medium' as const,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockReminderRepository.create.mockResolvedValue(mockCreatedReminder)

      await reminderService.createReminder(mockData)

      expect(mockReminderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'medium'
        })
      )
    })
  })

  describe('updateReminder', () => {
    it('should update reminder when found', async () => {
      const mockData = {
        title: 'Updated Reminder',
        priority: 'low' as const
      }

      const mockUpdatedReminder = {
        id: '1',
        title: 'Updated Reminder',
        description: 'Original description',
        dueDate: addDays(new Date(), 1),
        priority: 'low' as const,
        status: 'pending' as const,
        type: 'task' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockReminderRepository.findById.mockResolvedValue(mockUpdatedReminder)
      mockReminderRepository.update.mockResolvedValue(mockUpdatedReminder)

      const result = await reminderService.updateReminder('1', mockData)

      expect(result).toEqual(mockUpdatedReminder)
      expect(mockReminderRepository.findById).toHaveBeenCalledWith('1')
      expect(mockReminderRepository.update).toHaveBeenCalledWith('1', mockData)
    })

    it('should throw NotFoundError when reminder not found', async () => {
      mockReminderRepository.findById.mockResolvedValue(null)

      await expect(reminderService.updateReminder('1', {})).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteReminder', () => {
    it('should delete reminder when found', async () => {
      const mockReminder = {
        id: '1',
        title: 'Test Reminder',
        description: 'Test description',
        dueDate: addDays(new Date(), 1),
        priority: 'high' as const,
        status: 'pending' as const,
        type: 'task' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockReminderRepository.findById.mockResolvedValue(mockReminder)
      mockReminderRepository.delete.mockResolvedValue(true)

      const result = await reminderService.deleteReminder('1')

      expect(result).toBe(true)
      expect(mockReminderRepository.findById).toHaveBeenCalledWith('1')
      expect(mockReminderRepository.delete).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when reminder not found', async () => {
      mockReminderRepository.findById.mockResolvedValue(null)

      await expect(reminderService.deleteReminder('1')).rejects.toThrow(NotFoundError)
    })
  })

  describe('markAsCompleted', () => {
    it('should mark reminder as completed', async () => {
      const mockReminder = {
        id: '1',
        title: 'Test Reminder',
        description: 'Test description',
        dueDate: addDays(new Date(), 1),
        priority: 'high' as const,
        status: 'pending' as const,
        type: 'task' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockCompletedReminder = {
        ...mockReminder,
        status: 'completed' as const
      }

      mockReminderRepository.findById.mockResolvedValue(mockReminder)
      mockReminderRepository.update.mockResolvedValue(mockCompletedReminder)

      const result = await reminderService.markAsCompleted('1')

      expect(result).toEqual(mockCompletedReminder)
      expect(mockReminderRepository.update).toHaveBeenCalledWith('1', { status: 'completed' })
    })
  })

  describe('getUpcomingReminders', () => {
    it('should return upcoming reminders', async () => {
      const mockReminders = [
        {
          id: '1',
          title: 'Upcoming Reminder',
          description: 'Due soon',
          dueDate: addDays(new Date(), 1),
          priority: 'high' as const,
          status: 'pending' as const,
          type: 'task' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockReminderRepository.findUpcoming.mockResolvedValue(mockReminders)

      const result = await reminderService.getUpcomingReminders(7)

      expect(result).toEqual(mockReminders)
      expect(mockReminderRepository.findUpcoming).toHaveBeenCalledWith(7)
    })
  })
})
