import { Conversation, Message, Reminder, Draft } from "@mochiport/shared"

// Mock conversations for development
export const mockConversations: Conversation[] = [
  {
    id: "conversation_1",
    title: "AI アシスタントとの初回対話",
    messages: [
      {
        id: "msg_1",
        content: "こんにちは！AI チャット管理システムについて教えてください。",
        role: "user",
        timestamp: new Date("2024-01-01T10:00:00Z")
      },
      {
        id: "msg_2",
        content: "こんにちは！AI チャット管理システムは、AI との会話を効率的に管理し、リマインダーやドラフト機能を提供するアプリケーションです。どのような機能について詳しく知りたいですか？",
        role: "assistant",
        timestamp: new Date("2024-01-01T10:00:30Z")
      },
      {
        id: "msg_3",
        content: "リマインダー機能について詳しく教えてください。",
        role: "user",
        timestamp: new Date("2024-01-01T10:01:00Z")
      },
      {
        id: "msg_4",
        content: "リマインダー機能では、重要なタスクや会話の続きを忘れないよう通知を設定できます。優先度や種類を設定でき、スヌーズ機能も利用可能です。",
        role: "assistant",
        timestamp: new Date("2024-01-01T10:01:30Z")
      }
    ],
    status: "active",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:01:30Z"),
    metadata: {
      topic: "システム概要",
      tags: ["introduction", "features"]
    }
  },
  {
    id: "conversation_2",
    title: "TypeScript と React の最適化",
    messages: [
      {
        id: "msg_5",
        content: "TypeScript と React を組み合わせる際のパフォーマンス最適化について教えてください。",
        role: "user",
        timestamp: new Date("2024-01-02T14:30:00Z")
      },
      {
        id: "msg_6",
        content: "TypeScript と React のパフォーマンス最適化には以下の手法があります：\n\n1. React.memo() でコンポーネントのメモ化\n2. useMemo() と useCallback() でコンピューテッドバリューの最適化\n3. TypeScript の strict モードでランタイムエラーを防止\n4. 適切な型定義でバンドルサイズの削減",
        role: "assistant",
        timestamp: new Date("2024-01-02T14:30:45Z")
      }
    ],
    status: "active",
    createdAt: new Date("2024-01-02T14:30:00Z"),
    updatedAt: new Date("2024-01-02T14:30:45Z"),
    metadata: {
      topic: "開発",
      tags: ["typescript", "react", "performance"]
    }
  },
  {
    id: "conversation_3",
    title: "データベース設計の相談",
    messages: [
      {
        id: "msg_7",
        content: "チャット管理システムのデータベース設計で考慮すべき点は何ですか？",
        role: "user",
        timestamp: new Date("2024-01-03T09:15:00Z")
      }
    ],
    status: "active",
    createdAt: new Date("2024-01-03T09:15:00Z"),
    updatedAt: new Date("2024-01-03T09:15:00Z"),
    metadata: {
      topic: "データベース",
      tags: ["database", "design"]
    }
  }
]

// Mock reminders for development
export const mockReminders: Reminder[] = [
  {
    id: "reminder_1",
    title: "TypeScript 学習の続き",
    description: "React との組み合わせでのパフォーマンス最適化について調べる",
    dueDate: new Date("2024-01-05T10:00:00Z"),
    scheduledAt: new Date("2024-01-05T09:30:00Z"),
    priority: "high",
    type: "follow_up",
    status: "pending",
    conversationId: "conversation_2",
    createdAt: new Date("2024-01-02T14:35:00Z"),
    updatedAt: new Date("2024-01-02T14:35:00Z"),
    metadata: {
      source: "conversation",
      estimatedDuration: 60
    }
  },
  {
    id: "reminder_2",
    title: "データベース設計の回答を確認",
    description: "AI からの回答が来たら内容を確認し、実装に反映する",
    dueDate: new Date("2024-01-04T16:00:00Z"),
    scheduledAt: new Date("2024-01-04T15:30:00Z"),
    priority: "medium",
    type: "task",
    status: "pending",
    conversationId: "conversation_3",
    createdAt: new Date("2024-01-03T09:20:00Z"),
    updatedAt: new Date("2024-01-03T09:20:00Z"),
    metadata: {
      category: "development"
    }
  },
  {
    id: "reminder_3",
    title: "週次レビューミーティング",
    description: "チーム全体での進捗確認と次週の計画を立てる",
    dueDate: new Date("2024-01-06T14:00:00Z"),
    scheduledAt: new Date("2024-01-06T13:45:00Z"),
    priority: "medium",
    type: "meeting",
    status: "pending",
    conversationId: "conversation_1",
    createdAt: new Date("2024-01-01T08:00:00Z"),
    updatedAt: new Date("2024-01-01T08:00:00Z"),
    metadata: {
      recurring: "weekly",
      attendees: ["team_lead", "developers"]
    }
  },  {
    id: "reminder_4",
    title: "完了済みのタスク例",
    description: "この説明は完了済みのリマインダーの例です",
    dueDate: new Date("2024-01-01T12:00:00Z"),
    scheduledAt: new Date("2024-01-01T11:45:00Z"),
    priority: "low",
    type: "general",
    status: "completed",
    conversationId: "conversation_1",
    createdAt: new Date("2023-12-30T10:00:00Z"),
    updatedAt: new Date("2024-01-01T12:30:00Z"),
    metadata: {
      completedBy: "user_dev_123"
    }
  }
]

// Mock drafts for development
export const mockDrafts: Draft[] = [
  {
    id: "draft_1",
    title: "React Query の実装案",
    content: "```typescript\n// React Query の基本設定\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query'\n\nconst queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      staleTime: 1000 * 60 * 5, // 5分\n      cacheTime: 1000 * 60 * 30, // 30分\n    },\n  },\n})\n\n// カスタムフック例\nexport const useConversations = () => {\n  return useQuery({\n    queryKey: ['conversations'],\n    queryFn: () => conversationApi.getConversations(),\n  })\n}\n```\n\nこの実装では、データのキャッシュ戦略を適切に設定し...",
    status: "draft",
    type: "analysis",
    conversationId: "conversation_2",
    createdAt: new Date("2024-01-02T15:00:00Z"),
    updatedAt: new Date("2024-01-02T15:45:00Z"),
    metadata: {
      autoSaveCount: 12,
      wordCount: 156
    }
  },
  {
    id: "draft_2",
    title: "UI コンポーネントの改善提案",
    content: "# UI コンポーネントの改善提案\n\n## 現在の課題\n1. コンポーネントの再利用性が低い\n2. 一貫性のないデザインシステム\n3. パフォーマンスの問題\n\n## 提案する解決策\n\n### 1. デザインシステムの統一\n- shadcn/ui ベースのコンポーネントライブラリを構築\n- 色、タイポグラフィ、スペーシングの標準化\n\n### 2. パフォーマンス最適化\n- React.memo() の適用\n- 必要な箇所での useMemo(), useCallback() の使用\n\n### 3. アクセシビリティの向上\n- ARIA ラベルの追加\n- キーボードナビゲーションの改善\n\n## 実装スケジュール\n- Week 1: デザインシステムの定義\n- Week 2-3: 基本コンポーネントの実装\n- Week 4: 既存コンポーネントの移行",
    status: "draft",
    type: "summary",
    createdAt: new Date("2024-01-03T11:30:00Z"),
    updatedAt: new Date("2024-01-03T16:20:00Z"),
    metadata: {
      autoSaveCount: 8,
      wordCount: 234
    }
  },  {
    id: "draft_3",
    title: "アーカイブされたドラフト例",
    content: "これは古いアイデアのドラフトです。現在は使用していませんが、参考として保存されています。",
    status: "archived",
    type: "note",
    createdAt: new Date("2023-12-15T09:00:00Z"),
    updatedAt: new Date("2023-12-20T14:00:00Z"),
    metadata: {
      archiveReason: "outdated_idea"
    }
  }
]

/**
 * Initialize repositories with mock data for development
 */
export function seedMockData() {
  // This function would be called during application startup
  // to populate the in-memory repositories with mock data
  console.log('Mock data seeded successfully')
  console.log(`- ${mockConversations.length} conversations`)
  console.log(`- ${mockReminders.length} reminders`)
  console.log(`- ${mockDrafts.length} drafts`)
}

export {
  mockConversations as conversations,
  mockReminders as reminders,
  mockDrafts as drafts
}
