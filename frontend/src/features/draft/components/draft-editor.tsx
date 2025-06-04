"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Draft, CreateDraftData } from "@ai-chat/shared"
import { useCreateDraft, useUpdateDraft, useDebounce } from "@/lib/hooks"
import { X, Save, Send } from "lucide-react"

interface DraftEditorProps {
  draft?: Draft
  onClose?: () => void
  onSave?: (draft: Draft) => void
  onPublish?: (draft: Draft) => void
}

export function DraftEditor({ draft, onClose, onSave, onPublish }: DraftEditorProps) {
  const [formData, setFormData] = React.useState({
    title: draft?.title || "",
    content: draft?.content || "",
  })

  const [autoSaving, setAutoSaving] = React.useState(false)
  const createDraft = useCreateDraft()
  const updateDraft = useUpdateDraft()

  // Auto-save with debounce
  const debouncedContent = useDebounce(formData.content, 1000)
  const debouncedTitle = useDebounce(formData.title, 1000)

  React.useEffect(() => {
    if (draft && (debouncedContent !== draft.content || debouncedTitle !== draft.title)) {
      if (debouncedContent.trim() || debouncedTitle.trim()) {
        handleAutoSave()
      }
    }
  }, [debouncedContent, debouncedTitle])
  const handleAutoSave = async () => {
    if (!draft || !debouncedTitle.trim()) return

    setAutoSaving(true)
    
    try {
      const updateData = {
        title: debouncedTitle.trim(),
        content: debouncedContent,
      }
      
      await updateDraft.mutateAsync({
        id: draft.id,
        data: updateData
      })
      
      const updatedDraft = {
        ...draft,
        ...updateData,
        updatedAt: new Date(),
      }
      onSave?.(updatedDraft)
    } catch (error) {
      console.error("Auto-save failed:", error)
    } finally {
      setAutoSaving(false)
    }
  }
  const handleSave = async () => {
    if (!formData.title.trim()) return

    try {
      if (draft) {
        // Update existing draft
        const updateData = {
          title: formData.title.trim(),
          content: formData.content,
        }
        
        await updateDraft.mutateAsync({
          id: draft.id,
          data: updateData
        })
        
        const updatedDraft = {
          ...draft,
          ...updateData,
          updatedAt: new Date(),
        }
        onSave?.(updatedDraft)
      } else {
        // Create new draft
        const newDraftData: CreateDraftData = {
          conversationId: "default", // TODO: Get from context
          title: formData.title.trim(),
          content: formData.content,
          type: 'note' // Add required type property
        }
        
        const response = await createDraft.mutateAsync(newDraftData)
        // Extract the draft data from API response
        const newDraft = response.data || response
        onSave?.(newDraft)
      }
    } catch (error) {
      console.error("Failed to save draft:", error)
    }
  }
  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return

    try {
      let draftToPublish: Draft

      if (draft) {
        // Update existing draft first
        const updateData = {
          title: formData.title.trim(),
          content: formData.content,
          status: "published" as const,
        }
        
        await updateDraft.mutateAsync({
          id: draft.id,
          data: updateData
        })
        
        draftToPublish = {
          ...draft,
          ...updateData,
          updatedAt: new Date(),
        }
      } else {
        // Create new draft
        const newDraftData: CreateDraftData = {
          conversationId: "default", // TODO: Get from context
          title: formData.title.trim(),
          content: formData.content,
          type: 'note' // Add required type property
        }
        
        const response = await createDraft.mutateAsync(newDraftData)
        draftToPublish = response.data || response
      }
      
      onPublish?.(draftToPublish)
      onClose?.()
    } catch (error) {
      console.error("Failed to publish draft:", error)
    }
  }

  const isLoading = createDraft.isPending || updateDraft.isPending

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="text-lg">
          {draft ? "下書きを編集" : "新しい下書き"}
        </CardTitle>
        
        <div className="flex items-center space-x-2">
          {autoSaving && (
            <span className="text-xs text-muted-foreground">自動保存中...</span>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isLoading || !formData.title.trim()}
          >
            <Save className="h-3 w-3 mr-1" />
            保存
          </Button>
          
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
          >
            <Send className="h-3 w-3 mr-1" />
            送信
          </Button>
          
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
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="下書きのタイトルを入力"
            className="text-lg font-medium"
          />
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <Label htmlFor="content">内容</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="下書きの内容を入力..."
            className="flex-1 min-h-[400px] resize-none"
          />
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            文字数: {formData.content.length}
          </span>
          
          {draft && (
            <span>
              最終更新: {new Date(draft.updatedAt).toLocaleString("ja-JP")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
