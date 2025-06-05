"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Edit, Trash2, Pause } from "lucide-react"
import { REMINDER_PRIORITY, REMINDER_STATUS } from "@mochiport/shared"
import type { Reminder } from "@mochiport/shared"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { SnoozeDialog } from "./snooze-dialog"
import { cn } from "@/lib/utils"

interface ReminderCardProps {
  reminder: Reminder
  onSnooze: (id: string, newDueDate: Date) => void
  onComplete: (id: string) => void
  onEdit: (reminder: Reminder) => void
  onDelete: (id: string) => void
}

export function ReminderCard({
  reminder,
  onSnooze,
  onComplete,
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const [showSnoozeDialog, setShowSnoozeDialog] = React.useState(false)

  const isOverdue = reminder.status === REMINDER_STATUS.PENDING && 
    new Date(reminder.dueDate) < new Date()
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case REMINDER_PRIORITY.HIGH:
        return "destructive"
      case REMINDER_PRIORITY.MEDIUM:
        return "default"
      case REMINDER_PRIORITY.LOW:
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case REMINDER_PRIORITY.HIGH:
        return "高"
      case REMINDER_PRIORITY.MEDIUM:
        return "中"
      case REMINDER_PRIORITY.LOW:
        return "低"
      default:
        return "中"
    }
  }

  const getStatusIcon = () => {
    switch (reminder.status) {
      case REMINDER_STATUS.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case REMINDER_STATUS.SNOOZED:
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleSnooze = (newDueDate: Date) => {
    onSnooze(reminder.id, newDueDate)
  }

  return (
    <>
      <Card className={cn(
        "transition-all hover:shadow-md",
        isOverdue && "border-destructive bg-destructive/5",
        reminder.status === REMINDER_STATUS.COMPLETED && "opacity-75"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {getStatusIcon()}
              <CardTitle className="text-sm font-medium line-clamp-2">
                {reminder.title}
              </CardTitle>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={getPriorityColor(reminder.priority)}>
                {getPriorityLabel(reminder.priority)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {reminder.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {reminder.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className={cn(
                  isOverdue && "text-destructive font-medium"
                )}>
                  {formatDistanceToNow(new Date(reminder.dueDate), {
                    addSuffix: true,
                    locale: ja,
                  })}
                  {isOverdue && " (期限切れ)"}
                </span>
              </div>
              
              {reminder.status === REMINDER_STATUS.COMPLETED && reminder.completedAt && (
                <span className="text-green-600 text-xs">
                  完了: {formatDistanceToNow(new Date(reminder.completedAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              )}
            </div>

            {reminder.status === REMINDER_STATUS.PENDING && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onComplete(reminder.id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  完了
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSnoozeDialog(true)}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  スヌーズ
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(reminder)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  編集
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(reminder.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SnoozeDialog
        isOpen={showSnoozeDialog}
        onClose={() => setShowSnoozeDialog(false)}
        onSnooze={handleSnooze}
        reminderTitle={reminder.title}
      />
    </>
  )
}
