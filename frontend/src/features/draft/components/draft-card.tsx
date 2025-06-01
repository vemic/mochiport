"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, Send, Copy, Clock } from "lucide-react"
import type { Draft } from "@ai-chat/shared"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DraftCardProps {
  draft: Draft
  onEdit: (draft: Draft) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
  onDuplicate: (id: string) => void
}

export function DraftCard({
  draft,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
}: DraftCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "published":
        return "default"
      case "archived":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "下書き"
      case "published":
        return "公開済み"
      case "archived":
        return "アーカイブ"
      default:
        return "下書き"
    }
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "..."
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium line-clamp-2">
              {draft.title}
            </CardTitle>
          </div>
          
          <Badge variant={getStatusColor(draft.status)}>
            {getStatusLabel(draft.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncateContent(draft.content)}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(draft.updatedAt), {
                  addSuffix: true,
                  locale: ja,
                })}に更新
              </span>
            </div>
            
            {draft.conversationId && (
              <span className="text-xs text-muted-foreground">
                会話に関連
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onEdit(draft)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              編集
            </Button>
            
            {draft.status === "draft" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPublish(draft.id)}
              >
                <Send className="h-3 w-3 mr-1" />
                送信
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(draft.id)}
            >
              <Copy className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(draft.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
