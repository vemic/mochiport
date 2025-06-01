"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DraftContainer } from "@/features/draft"
import { Plus, FileText } from "lucide-react"

export default function DraftsPage() {
  const [showEditor, setShowEditor] = React.useState(false)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">下書き</h1>
          <p className="text-muted-foreground">
            下書きを作成・編集して、後で送信できます
          </p>
        </div>
        
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新しい下書き
        </Button>
      </div>

      <DraftContainer 
        showEditor={showEditor}
        onEditorClose={() => setShowEditor(false)} 
      />
    </div>
  )
}
