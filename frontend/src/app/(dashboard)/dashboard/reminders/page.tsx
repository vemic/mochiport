"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ReminderContainer } from "@/features/reminder"
import { Plus } from "lucide-react"

export default function RemindersPage() {
  const [showForm, setShowForm] = React.useState(false)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">リマインダー</h1>
          <p className="text-muted-foreground">
            重要なタスクを忘れないようにリマインダーを設定しましょう
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新しいリマインダー
        </Button>
      </div>

      <ReminderContainer 
        showForm={showForm} 
        onFormClose={() => setShowForm(false)} 
      />
    </div>
  )
}
