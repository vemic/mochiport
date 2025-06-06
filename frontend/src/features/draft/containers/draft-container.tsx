"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { DraftCard } from "../components/draft-card"
import { DraftEditor } from "../components/draft-editor"
import { useDrafts } from "@/lib/hooks"
import type { Draft } from "@mochiport/shared"

interface DraftListProps {
  drafts: Draft[]
  isLoading: boolean
  onEdit: (draft: Draft) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
  onDuplicate: (id: string) => void
}

export function DraftList({
  drafts,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
}: DraftListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-48 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">下書きがありません</p>
      </Card>
    )
  }

  // Sort by updated date
  const sortedDrafts = [...drafts].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedDrafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onEdit={onEdit}
          onDelete={onDelete}
          onPublish={onPublish}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  )
}

interface DraftContainerProps {
  showEditor?: boolean
  editingDraft?: Draft
  onEditorClose?: () => void
}

export function DraftContainer({ showEditor = false, editingDraft, onEditorClose }: DraftContainerProps) {
  const [currentDraft, setCurrentDraft] = React.useState<Draft | undefined>(editingDraft)
  
  const draftsQuery = useDrafts()
  const drafts = draftsQuery.data?.data || []
  const isLoading = draftsQuery.isLoading

  const handleEdit = (draft: Draft) => {
    setCurrentDraft(draft)
  }
  const handlePublish = (id: string) => {
    // TODO: Implement publish mutation
    // console.log('Publishing draft:', id)
  }

  const handleDuplicate = (id: string) => {
    // TODO: Implement duplicate mutation
    // console.log('Duplicating draft:', id)
  }
    const handleDelete = (id: string) => {
    // TODO: Implement delete mutation
    // console.log('Deleting draft:', id)
  }

  const handleEditorClose = () => {
    setCurrentDraft(undefined)
    onEditorClose?.()
  }

  const handleSave = (draft: Draft) => {
    setCurrentDraft(draft)
  }

  const handlePublishFromEditor = (draft: Draft) => {
        // TODO: Implement publish from editor
    // console.log('Publishing draft from editor:', draft.id)
  }

  if (showEditor || currentDraft) {
    return (
      <DraftEditor
        draft={currentDraft}
        onClose={handleEditorClose}
        onSave={handleSave}
        onPublish={handlePublishFromEditor}
      />
    )
  }

  return (
    <DraftList
      drafts={drafts}
      isLoading={isLoading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onPublish={handlePublish}
      onDuplicate={handleDuplicate}
    />
  )
}
