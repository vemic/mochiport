# 拡張性重視 GitHub Copilot向けプロジェクト構成指示書

## プロジェクト概要
- **アーキテクチャ**: Frontend/Backend分離型モノレポ
- **フォーカス**: 拡張性・保守性・チーム開発対応
- **技術スタック**: Next.js 15 + React 19 + Azure Functions + TypeScript
- **パッケージ管理**: Turborepo + pnpm Workspaces

## 核心設計原則

### 1. 拡張性の階層戦略
```
Phase 1 (1-3人): useState + カスタムフック
Phase 2 (3-10人): Zustand + Context API
Phase 3 (10人+): マイクロフロントエンド + 独立デプロイ
```

### 2. 責務分離アーキテクチャ
- **Presentation Layer**: UIコンポーネント（状態なし）
- **Container Layer**: 状態管理とビジネスロジック接続
- **Service Layer**: ビジネスロジックの実装
- **Repository Layer**: データアクセス抽象化
- **Infrastructure Layer**: 外部サービス統合

## プロジェクト構造（拡張性重視）

```bash
ai-chat-management-app/
├── frontend/                    # Next.js フロントエンド
│   ├── src/
│   │   ├── app/                # App Router（ルーティングのみ）
│   │   │   ├── (dashboard)/    # ルートグループ
│   │   │   ├── (auth)/
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── components/         # 再利用可能コンポーネント
│   │   │   ├── ui/            # プリミティブコンポーネント
│   │   │   ├── layouts/       # レイアウトコンポーネント
│   │   │   └── features/      # 機能固有コンポーネント
│   │   ├── features/          # ドメイン機能モジュール
│   │   │   ├── chat/
│   │   │   │   ├── components/
│   │   │   │   ├── containers/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── types.ts
│   │   │   ├── reminder/
│   │   │   └── draft/
│   │   ├── lib/               # ライブラリ統合
│   │   │   ├── stores/        # 状態管理
│   │   │   ├── hooks/         # カスタムフック
│   │   │   ├── utils/         # ユーティリティ
│   │   │   └── api/           # API クライアント
│   │   ├── types/             # 型定義
│   │   │   ├── api.ts
│   │   │   ├── models.ts
│   │   │   └── ui.ts
│   │   └── constants/         # 定数定義
│   ├── package.json
│   └── next.config.ts
├── backend/                    # Node.js + Azure Functions
│   ├── src/
│   │   ├── functions/         # Azure Functions エンドポイント
│   │   │   ├── chat/
│   │   │   ├── reminder/
│   │   │   └── draft/
│   │   ├── services/          # ビジネスロジック
│   │   │   ├── ChatService.ts
│   │   │   ├── ReminderService.ts
│   │   │   └── DraftService.ts
│   │   ├── repositories/      # データアクセス層
│   │   │   ├── ChatRepository.ts
│   │   │   └── interfaces/
│   │   ├── models/            # ドメインモデル
│   │   ├── middleware/        # 共通処理
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── error.ts
│   │   ├── utils/
│   │   └── types/
│   ├── host.json
│   └── package.json
├── shared/                     # 共有コード
│   ├── types/                 # 共通型定義
│   │   ├── conversation.ts
│   │   ├── reminder.ts
│   │   └── api.ts
│   ├── constants/             # 共通定数
│   ├── utils/                 # 共通ユーティリティ
│   └── validation/            # バリデーションスキーマ
├── packages/                   # 再利用可能パッケージ
│   ├── ui-components/         # UIコンポーネントライブラリ
│   ├── eslint-config/         # ESLint設定共有
│   └── tsconfig/              # TypeScript設定共有
├── apps/                       # 独立アプリケーション（将来拡張用）
│   └── admin-dashboard/       # 管理画面（将来実装）
├── docs/                       # ドキュメント
├── turbo.json                  # Turborepo設定
├── pnpm-workspace.yaml        # pnpm Workspaces設定
└── package.json               # ルート設定
```

## Copilot向け実装パターン

### 1. コンポーネント生成テンプレート
```typescript
// Feature-based コンポーネントテンプレート
'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from './types';

interface Props extends ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Component = memo<Props>(({ 
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'component-base',
        `variant-${variant}`,
        `size-${size}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Component.displayName = 'Component';
```

### 2. Service層実装パターン
```typescript
// Service層の拡張可能な実装
export abstract class BaseService<T> {
  protected repository: Repository<T>;
  
  constructor(repository: Repository<T>) {
    this.repository = repository;
  }
  
  abstract validate(data: Partial<T>): Promise<ValidationResult>;
}

export class ChatService extends BaseService<Conversation> {
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    // バリデーション -> ビジネスロジック -> 永続化
    const validation = await this.validate(data);
    if (!validation.isValid) throw new ValidationError(validation.errors);
    
    return this.repository.create(data);
  }
  
  async validate(data: Partial<Conversation>): Promise<ValidationResult> {
    // 複雑なバリデーションロジック
  }
}
```

### 3. 状態管理の段階的拡張
```typescript
// Phase 1: カスタムフック（小規模）
export const useConversation = (id: string) => {
  const [conversation, setConversation] = useState<Conversation>();
  const [loading, setLoading] = useState(false);
  
  // ロジック実装
  
  return { conversation, loading, actions };
};

// Phase 2: Zustand（中規模）
interface ConversationStore {
  conversations: Conversation[];
  selectedId: string | null;
  // アクション
  actions: {
    select: (id: string) => void;
    create: (data: CreateConversationData) => Promise<void>;
    update: (id: string, data: Partial<Conversation>) => Promise<void>;
  };
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  selectedId: null,
  actions: {
    select: (id) => set({ selectedId: id }),
    create: async (data) => {
      // 実装
    },
    update: async (id, data) => {
      // 実装
    }
  }
}));

// Phase 3: マイクロフロントエンド（大規模）
// Module Federation でのコンポーネント公開
```

### 4. API設計の拡張性
```typescript
// API Gateway パターン
export class ApiGateway {
  private services: Map<string, BaseService> = new Map();
  
  registerService(name: string, service: BaseService) {
    this.services.set(name, service);
  }
  
  async execute(serviceName: string, method: string, ...args: any[]) {
    const service = this.services.get(serviceName);
    if (!service) throw new Error(`Service ${serviceName} not found`);
    
    return service[method](...args);
  }
}

// バージョニング対応
export const createApiHandler = (version: 'v1' | 'v2' = 'v2') => {
  return async (req: NextRequest) => {
    const handler = apiHandlers[version];
    return handler(req);
  };
};
```

## Azure統合の拡張性

### 1. Functions構成
```typescript
// 拡張可能なAzure Functions構造
export class FunctionHandler {
  constructor(
    private service: BaseService,
    private middleware: Middleware[]
  ) {}
  
  async handle(context: Context, req: HttpRequest) {
    // ミドルウェア実行
    for (const mw of this.middleware) {
      await mw.execute(context, req);
    }
    
    // サービス実行
    return this.service.execute(req.body);
  }
}

// Function登録
export const chatHandler = new FunctionHandler(
  new ChatService(new CosmosDbRepository()),
  [authMiddleware, validationMiddleware, loggingMiddleware]
);
```

### 2. スケーリング戦略
```yaml
# Azure DevOps YAML
trigger:
  branches:
    include:
    - main
    - develop
  paths:
    include:
    - frontend/**
    - backend/**

stages:
- stage: Build
  jobs:
  - job: BuildFrontend
    condition: or(
      contains(variables['Build.SourceVersionMessage'], '[frontend]'),
      eq(variables['Build.Reason'], 'Manual')
    )
    
- stage: Deploy
  dependsOn: Build
  jobs:
  - deployment: DeployToStaging
    environment: staging
  - deployment: DeployToProduction
    environment: production
    condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
```

## パフォーマンス拡張性

### 1. コード分割戦略
```typescript
// 動的インポート + Suspense
const ChatFeature = lazy(() => import('../features/chat'));
const ReminderFeature = lazy(() => import('../features/reminder'));

export const FeatureLoader = ({ feature }: { feature: string }) => (
  <Suspense fallback={<FeatureSkeleton />}>
    {feature === 'chat' && <ChatFeature />}
    {feature === 'reminder' && <ReminderFeature />}
  </Suspense>
);
```

### 2. キャッシュ戦略
```typescript
// React Query + 階層キャッシュ
export const useConversations = (filters?: ConversationFilters) => {
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => conversationService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5分
    cacheTime: 10 * 60 * 1000, // 10分
  });
};
```

## 開発フロー最適化

### 1. Turborepo設定
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

### 2. 品質保証
```typescript
// 型安全性の確保
export type StrictMode<T> = {
  [K in keyof T]-?: T[K] extends object 
    ? StrictMode<T[K]> 
    : NonNullable<T[K]>;
};

// エラーハンドリング
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
```

## Copilot最適化のための指示

### コード生成時の注意点
- 全ての非同期処理に適切なエラーハンドリングを実装
- TypeScript strict モードに準拠した型定義
- コンポーネントにはDisplayNameを必須設定
- カスタムフックには適切な依存配列を設定
- API呼び出しには適切なキャッシュ戦略を実装

### プロンプト例
```
/* 
チャット機能のDraft管理コンポーネントを作成してください。
要件:
- Container/Presentationパターンを採用
- Zustand for 状態管理
- 一括確定・個別確定機能
- TypeScript strict mode準拠
- エラーハンドリング完備
- テスト可能な構造
*/
```

この構成により、個人開発から大規模チーム開発まで段階的にスケールできる、真の意味での拡張性の高いプロジェクトを実現できます。