"use client"

import { Card } from "@/components/ui/card"
import { ReminderCard } from "../components/reminder-card"
import { ReminderForm } from "../components/reminder-form"
import { useReminders } from "@/lib/hooks"
import { REMINDER_PRIORITY } from "@mochiport/shared"
import type { Reminder } from "@mochiport/shared"

interface ReminderListProps {
  reminders: Reminder[]
  isLoading: boolean
  onSnooze: (id: string, newDueDate: Date) => void
  onComplete: (id: string) => void
  onEdit: (reminder: Reminder) => void
  onDelete: (id: string) => void
}

export function ReminderList({
  reminders,
  isLoading,
  onSnooze,
  onComplete,
  onEdit,
  onDelete,
}: ReminderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">リマインダーがありません</p>
      </Card>
    )
  }

  // Sort by priority and due date
  const sortedReminders = [...reminders].sort((a, b) => {
    const priorityOrder = {
      [REMINDER_PRIORITY.HIGH]: 3,
      [REMINDER_PRIORITY.MEDIUM]: 2,
      [REMINDER_PRIORITY.LOW]: 1,
    }
    
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedReminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onSnooze={onSnooze}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface ReminderContainerProps {
  showForm?: boolean
  onFormClose?: () => void
}

export function ReminderContainer({ showForm = false, onFormClose }: ReminderContainerProps) {
  const remindersQuery = useReminders()
  const reminders = remindersQuery.data?.data || []
  const isLoading = remindersQuery.isLoading
  const handleSnooze = (id: string, newDueDate: Date) => {
    // TODO: Implement snooze mutation
    console.log('Snoozing reminder:', id, 'until:', newDueDate)
  }

  const handleComplete = (id: string) => {
    // TODO: Implement complete mutation
    console.log('Completing reminder:', id)
  }

  const handleEdit = (reminder: Reminder) => {
    // TODO: Implement update mutation
    console.log('Editing reminder:', reminder.id)
  }

  const handleDelete = (id: string) => {
    // TODO: Implement delete mutation
    console.log('Deleting reminder:', id)
  }

  return (
    <div className="space-y-6">
      {showForm && (
        <ReminderForm onClose={onFormClose} />
      )}
      <ReminderList
        reminders={reminders}
        isLoading={isLoading}
        onSnooze={handleSnooze}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
