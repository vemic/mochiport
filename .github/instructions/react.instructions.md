---
applyTo: "frontend/src/**/*.{tsx,jsx}"
---
# React Component Instructions

## React 19 & Next.js 15 対応コンポーネント作成ルール

### 基本コンポーネント構造
```typescript
import React from 'react';

interface ComponentNameProps {
  // 必須プロパティを先に定義
  title: string;
  content: string;
  
  // オプショナルプロパティは後に定義
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  
  // イベントハンドラー
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  
  // Children は最後
  children?: React.ReactNode;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  content,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  onSubmit,
  children
}) => {
  // コンポーネントロジック
  
  return (
    <div className={clsx('component-base', className, {
      [`variant-${variant}`]: variant,
      [`size-${size}`]: size,
      'disabled': disabled
    })}>
      <h2>{title}</h2>
      <p>{content}</p>
      {children}
    </div>
  );
};

// DisplayName は必須
ComponentName.displayName = 'ComponentName';
```

### フォームコンポーネント
```typescript
import React, { useState, useCallback } from 'react';
import { z } from 'zod';

// バリデーションスキーマ
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((
    field: keyof FormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラークリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    
    // バリデーション
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(result.data);
      // 成功時のリセット
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Submission failed' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          disabled={isSubmitting}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span id="message-error" className="error" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {errors.submit && (
        <div className="error" role="alert">
          {errors.submit}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isSubmitting}
        aria-describedby={isSubmitting ? 'submit-status' : undefined}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      {isSubmitting && (
        <span id="submit-status" className="sr-only">
          Form is being submitted
        </span>
      )}
    </form>
  );
};

ContactForm.displayName = 'ContactForm';
```

### モーダルコンポーネント
```typescript
import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // フォーカス管理
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // ESCキーでクローズ
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback((
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={clsx('modal-content', `modal-${size}`, className)}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';
```

### パフォーマンス最適化のガイドライン

#### 1. React.memo の適切な使用
```typescript
// ✅ 適切な使用例: プロパティが頻繁に変わらないコンポーネント
const ExpensiveListItem = React.memo<ListItemProps>(({ 
  item, 
  onAction 
}) => {
  return (
    <div className="list-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <button onClick={() => onAction(item.id)}>
        Action
      </button>
    </div>
  );
});

// カスタム比較関数（必要な場合のみ）
const ComplexComponent = React.memo<ComplexProps>(
  ({ data, options }) => {
    // コンポーネント実装
  },
  (prevProps, nextProps) => {
    // 深い比較が必要な場合
    return isEqual(prevProps.data, nextProps.data) &&
           isEqual(prevProps.options, nextProps.options);
  }
);
```

#### 2. useMemo と useCallback の適切な使用
```typescript
const DataVisualization: React.FC<DataProps> = ({ rawData, filters }) => {
  // 重い計算処理のメモ化
  const processedData = useMemo(() => {
    return heavyDataProcessing(rawData, filters);
  }, [rawData, filters]);

  // イベントハンドラーのメモ化
  const handleDataClick = useCallback((dataPoint: DataPoint) => {
    // データポイントクリック処理
    console.log('Clicked:', dataPoint);
  }, []); // 依存配列が空の場合

  const handleFilterChange = useCallback((newFilter: Filter) => {
    // フィルター変更処理
    updateFilters(newFilter);
  }, [updateFilters]); // updateFilters が依存配列に含まれる

  return (
    <div>
      {processedData.map(item => (
        <DataPoint
          key={item.id}
          data={item}
          onClick={handleDataClick}
        />
      ))}
    </div>
  );
};
```

## アクセシビリティ要件

### 必須のアクセシビリティ属性
```typescript
// ✅ アクセシブルなボタンコンポーネント
const AccessibleButton: React.FC<ButtonProps> = ({
  children,
  disabled,
  loading,
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      aria-disabled={disabled || loading}
      aria-label={loading ? 'Loading...' : undefined}
      aria-describedby={loading ? 'loading-status' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span aria-hidden="true">⏳</span>
          <span id="loading-status" className="sr-only">
            Loading, please wait
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
```

## テストしやすいコンポーネント設計

```typescript
// ✅ テストしやすい設計
interface TestableComponentProps {
  data: DataItem[];
  onItemSelect: (item: DataItem) => void;
  loading?: boolean;
  error?: string | null;
  testId?: string; // テスト用のID
}

export const TestableComponent: React.FC<TestableComponentProps> = ({
  data,
  onItemSelect,
  loading = false,
  error = null,
  testId = 'testable-component'
}) => {
  if (loading) {
    return (
      <div data-testid={`${testId}-loading`}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid={`${testId}-error`} role="alert">
        Error: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div data-testid={`${testId}-empty`}>
        No data available
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      {data.map(item => (
        <button
          key={item.id}
          data-testid={`${testId}-item-${item.id}`}
          onClick={() => onItemSelect(item)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};
```
