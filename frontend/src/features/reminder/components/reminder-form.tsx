"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REMINDER_PRIORITY, REMINDER_TYPE } from "@mochiport/shared"
import type { Reminder, CreateReminderData } from "@mochiport/shared"
import { useCreateReminder, useUpdateReminder } from "@/lib/hooks"
import { X, Calendar, Clock } from "lucide-react"

interface ReminderFormProps {
  reminder?: Reminder
  onClose?: () => void
  onSave?: (reminder: Reminder) => void
}

export function ReminderForm({ reminder, onClose, onSave }: ReminderFormProps) {
  const [formData, setFormData] = React.useState({
    title: reminder?.title || "",
    description: reminder?.description || "",
    dueDate: reminder ? new Date(reminder.dueDate).toISOString().slice(0, 16) : "",
    priority: reminder?.priority || REMINDER_PRIORITY.MEDIUM,
    type: reminder?.type || REMINDER_TYPE.CUSTOM,
  })

  const createReminder = useCreateReminder()
  const updateReminder = useUpdateReminder()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.dueDate) return

    try {      if (reminder) {
        // Update existing reminder
        const updateData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          scheduledAt: new Date(formData.dueDate),
          type: formData.type,
          metadata: {
            priority: formData.priority,
          },
        }
        
        await updateReminder.mutateAsync({ id: reminder.id, data: updateData })
        
        const updatedReminder = {
          ...reminder,
          ...updateData,
          dueDate: new Date(formData.dueDate),
          priority: formData.priority,
          updatedAt: new Date(),
        }
        onSave?.(updatedReminder)
      } else {
        // Create new reminder
        const newReminderData: CreateReminderData = {
          conversationId: "default", // TODO: Get from context or prop
          title: formData.title.trim(),
          description: formData.description.trim(),
          scheduledAt: new Date(formData.dueDate),
          type: formData.type,
          metadata: {
            priority: formData.priority,
          },
        }
          const response = await createReminder.mutateAsync(newReminderData)
        if (response.data) {
          onSave?.(response.data)
        }
      }
      
      onClose?.()
    } catch (error) {
      console.error("Failed to save reminder:", error)
    }
  }

  const isLoading = createReminder.isPending || updateReminder.isPending

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">
          {reminder ? "リマインダーを編集" : "新しいリマインダー"}
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="リマインダーのタイトルを入力"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="リマインダーの詳細を入力（任意）"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">期限 *</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">優先度</Label>
              <Select value={formData.priority} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, priority: value as typeof REMINDER_PRIORITY[keyof typeof REMINDER_PRIORITY] }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={REMINDER_PRIORITY.HIGH}>高</SelectItem>
                  <SelectItem value={REMINDER_PRIORITY.MEDIUM}>中</SelectItem>
                  <SelectItem value={REMINDER_PRIORITY.LOW}>低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">種類</Label>
            <Select value={formData.type} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, type: value as typeof REMINDER_TYPE[keyof typeof REMINDER_TYPE] }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="種類を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REMINDER_TYPE.FOLLOW_UP}>フォローアップ</SelectItem>
                <SelectItem value={REMINDER_TYPE.DEADLINE}>期限</SelectItem>
                <SelectItem value={REMINDER_TYPE.MEETING}>会議</SelectItem>
                <SelectItem value={REMINDER_TYPE.CUSTOM}>カスタム</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !formData.title.trim() || !formData.dueDate}>
              {isLoading ? "保存中..." : reminder ? "更新" : "作成"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
