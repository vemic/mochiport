"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface SnoozeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSnooze: (newDueDate: Date) => void
  reminderTitle: string
}

export function SnoozeDialog({ isOpen, onClose, onSnooze, reminderTitle }: SnoozeDialogProps) {
  const [selectedOption, setSelectedOption] = React.useState("")

  const snoozeOptions = [
    { value: "15min", label: "15分後", minutes: 15 },
    { value: "1hour", label: "1時間後", minutes: 60 },
    { value: "tomorrow", label: "明日", getDueDate: () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      return tomorrow
    }},
    { value: "nextWeek", label: "来週", getDueDate: () => {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(9, 0, 0, 0)
      return nextWeek
    }},
  ]

  const handleSnooze = () => {
    const option = snoozeOptions.find(opt => opt.value === selectedOption)
    if (!option) return

    let newDueDate: Date
    if (option.getDueDate) {
      newDueDate = option.getDueDate()
    } else {
      newDueDate = new Date()
      newDueDate.setMinutes(newDueDate.getMinutes() + (option.minutes || 0))
    }

    onSnooze(newDueDate)
    onClose()
    setSelectedOption("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">スヌーズ設定</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">リマインダー</Label>
            <p className="font-medium">{reminderTitle}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="snooze-time">スヌーズ時間</Label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger>
                <SelectValue placeholder="時間を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {snoozeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleSnooze} disabled={!selectedOption}>
              スヌーズ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
