---
applyTo: "**/*.{ts,tsx,js,jsx}"
---
# Coding Standards Instructions

## 基本方針
- **責務分離**: Presentation/Container/Service/Repository層
- **拡張性**: 段階的スケーリング対応（useState → Zustand → マイクロフロントエンド）
- **型安全性**: TypeScript strict mode準拠

## ディレクトリ構造

### Frontend (`frontend/src/`)
```
src/
├── app/                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # UI基盤コンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── feature/            # 機能特化コンポーネント
│   │   ├── chat/
│   │   ├── ai-assistant/
│   │   └── dashboard/
│   └── layout/             # レイアウトコンポーネント
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── hooks/                  # カスタムフック
│   ├── use-api.ts
│   ├── use-local-storage.ts
│   └── use-chat.ts
├── lib/                    # ユーティリティ・設定
│   ├── utils.ts
│   ├── api.ts
│   └── constants.ts
├── stores/                 # 状態管理（Zustand）
│   ├── auth.ts
│   ├── chat.ts
│   └── ui.ts
├── types/                  # 型定義
│   ├── api.ts
│   ├── chat.ts
│   └── user.ts
└── styles/                 # スタイル
    ├── globals.css
    └── components.css
```

### Backend (`backend/src/`)
```
src/
├── functions/              # Azure Functions
│   ├── chat/
│   ├── auth/
│   └── api/
├── services/               # ビジネスロジック
│   ├── ChatService.ts
│   ├── AuthService.ts
│   └── AIService.ts
├── repositories/           # データアクセス層
│   ├── ConversationRepository.ts
│   ├── UserRepository.ts
│   └── DraftRepository.ts
├── models/                 # データモデル
│   ├── Conversation.ts
│   ├── User.ts
│   └── Draft.ts
├── middleware/             # ミドルウェア
│   ├── auth.ts
│   ├── validation.ts
│   └── logging.ts
├── utils/                  # ユーティリティ
│   ├── logger.ts
│   ├── encryption.ts
│   └── validation.ts
└── types/                  # 型定義
    ├── api.ts
    ├── database.ts
    └── services.ts
```

## TypeScript規約

### 型定義
```typescript
// ✅ 良い例: 明確な型定義
interface User {
  readonly id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ❌ 悪い例: any型の使用
const userData: any = {};

// ✅ 良い例: ジェネリクス活用
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}
```

### 関数定義
```typescript
// ✅ 良い例: 明確な戻り値型
async function fetchUser(id: string): Promise<User | null> {
  // 実装
}

// ✅ 良い例: エラーハンドリング付き
async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

## React規約

### コンポーネント定義
```typescript
// ✅ 良い例: 完全なコンポーネント定義
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// DisplayName必須
Button.displayName = 'Button';
```

### カスタムフック
```typescript
// ✅ 良い例: 適切な依存配列とエラーハンドリング
export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, JSON.stringify(options)]); // 適切な依存配列

  return { data, loading, error };
}
```

## エラーハンドリング規約

### 非同期処理のエラーハンドリング
```typescript
// ✅ 良い例: 包括的なエラーハンドリング
async function processData(input: unknown): Promise<ProcessedData> {
  // 入力検証
  if (!isValidInput(input)) {
    throw new ValidationError('Invalid input format');
  }

  try {
    // データ処理
    const processed = await heavyProcessing(input);
    return processed;
  } catch (error) {
    // 詳細なエラーログ
    logger.error('Data processing failed', {
      input,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // 適切なエラー再スロー
    if (error instanceof ValidationError) {
      throw error; // ビジネスエラーはそのまま
    }
    throw new ProcessingError('Data processing failed', { cause: error });
  }
}
```

## テスト規約

### Unit Test
```typescript
// ✅ 良い例: 包括的なテストケース
describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('btn-primary', 'btn-md');
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Test
```typescript
// ✅ 良い例: APIとの統合テスト
describe('useApi Hook', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: '1', name: 'Test User' };
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const { result } = renderHook(() => useApi<User>('/api/users/1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });
});
```

## パフォーマンス最適化

### React パフォーマンス
```typescript
// ✅ 良い例: メモ化の適切な使用
const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({ 
  data, 
  onAction 
}) => {
  const processedData = useMemo(() => {
    return heavyDataProcessing(data);
  }, [data]);

  const handleAction = useCallback((actionType: string) => {
    onAction(actionType, data.id);
  }, [onAction, data.id]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onAction={handleAction} />
      ))}
    </div>
  );
});

ExpensiveComponent.displayName = 'ExpensiveComponent';
```

## 命名規約

### ファイル・ディレクトリ
- **コンポーネント**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **フック**: camelCase with use prefix (`useApi.ts`, `useLocalStorage.ts`)
- **ユーティリティ**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **型定義**: camelCase (`user.ts`, `apiTypes.ts`)

### 変数・関数
- **変数**: camelCase (`userName`, `isLoading`)
- **定数**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **関数**: camelCase (`fetchUser`, `validateInput`)
- **コンポーネント**: PascalCase (`Button`, `UserProfile`)

## Import/Export規約

```typescript
// ✅ 良い例: 整理されたインポート
// 1. React関連
import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next/next';

// 2. サードパーティライブラリ
import { z } from 'zod';
import { clsx } from 'clsx';

// 3. 内部モジュール（絶対パス）
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { User } from '@/types/user';

// 4. 相対パス
import './ComponentName.css';

// ✅ 良い例: Named Exportの使用
export const ComponentName: React.FC<Props> = () => {
  // 実装
};

// Default Exportは最小限に
export default ComponentName;
```

## 実装テンプレート

### コンポーネント生成テンプレート
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

### Service層抽象クラステンプレート
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
  async createConversation(
    data: CreateConversationData
  ): Promise<Conversation> {
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

### API Gateway パターン
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
export const createApiHandler = (version: "v1" | "v2" = "v2") => {
  return async (req: NextRequest) => {
    const handler = apiHandlers[version];
    return handler(req);
  };
};
```

### 状態管理の段階的拡張
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
    },
  },
}));
```
