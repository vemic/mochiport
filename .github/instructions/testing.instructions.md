---
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx}"
---
# Testing Instructions

## Testing Library & Jest セットアップ

### React Testing Library 基本原則
- **ユーザーの視点でテスト**: 実装詳細ではなく、ユーザーの操作と結果をテスト
- **アクセシビリティ重視**: role, label, text などでエレメントを特定
- **統合テスト志向**: 単体テストより統合テストを重視

### 基本的なコンポーネントテスト
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show loading state', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### フォームテスト
```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/forms/ContactForm';

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(<ContactForm onSubmit={mockOnSubmit} />);
    
    // 空のフォームで送信
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    // バリデーションエラーが表示される
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message with enough characters.'
    };
    
    render(<ContactForm onSubmit={mockOnSubmit} />);
    
    // フォームに入力
    await user.type(screen.getByLabelText('Name'), formData.name);
    await user.type(screen.getByLabelText('Email'), formData.email);
    await user.type(screen.getByLabelText('Message'), formData.message);
    
    // 送信
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(formData);
    });
  });

  it('should handle submission errors', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Submission failed';
    mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ContactForm onSubmit={mockOnSubmit} />);
    
    // 有効なデータで入力
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Message'), 'Valid message content');
    
    // 送信
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
```

### カスタムフックテスト
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@/hooks/useApi';

// モックデータ
const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };

// fetch のモック
global.fetch = jest.fn();

describe('useApi Hook', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch data successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useApi<typeof mockUser>('/api/users/1'));

    // 初期状態
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // データ取得完了を待つ
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/api/users/1', undefined);
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'HTTP error! status: 404';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useApi('/api/users/999'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useApi('/api/users/1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
});
```

### モーダルコンポーネントテスト
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    defaultProps.onClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render modal content when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when escape key is pressed', async () => {
    const user = userEvent.setup();
    
    render(<Modal {...defaultProps} />);
    
    await user.keyboard('{Escape}');
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when overlay is clicked', async () => {
    const user = userEvent.setup();
    
    render(<Modal {...defaultProps} closeOnOverlayClick={true} />);
    
    // オーバーレイをクリック
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close modal when overlay is clicked and closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    
    render(<Modal {...defaultProps} closeOnOverlayClick={false} />);
    
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
```

### API統合テスト
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '@/components/UserProfile';

// MSW サーバーセットアップ
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        id,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatars/john.jpg'
      })
    );
  }),
  
  rest.put('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile Integration', () => {
  it('should load and display user data', async () => {
    render(<UserProfile userId="1" />);
    
    // ローディング状態
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // データ読み込み完了を待つ
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/avatars/john.jpg');
  });

  it('should handle update user data', async () => {
    const user = userEvent.setup();
    
    render(<UserProfile userId="1" />);
    
    // データ読み込み完了を待つ
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // 編集モードに切り替え
    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    
    // 名前を変更
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');
    
    // 保存
    await user.click(screen.getByRole('button', { name: 'Save' }));
    
    // 成功メッセージを確認
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    // エラーレスポンスを設定
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: 'User not found' }));
      })
    );
    
    render(<UserProfile userId="999" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: User not found')).toBeInTheDocument();
    });
  });
});
```

## E2Eテスト指針（Playwright推奨）

### 基本的なE2Eテスト
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // ログインフォームに入力
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    
    // ログインボタンをクリック
    await page.click('[data-testid="login-button"]');
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-welcome"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});
```

## テストのベストプラクティス

### 1. テストデータの管理
```typescript
// テストファクトリー関数
export const createTestUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date('2024-01-01'),
  ...overrides
});

export const createTestConversation = (overrides = {}) => ({
  id: '1',
  title: 'Test Conversation',
  messages: [],
  userId: '1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
});
```

### 2. テストヘルパー関数
```typescript
// カスタムレンダー関数
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions = {}
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider theme={testTheme}>
        <QueryClient client={testQueryClient}>
          {children}
        </QueryClient>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// 認証されたユーザーでのレンダー
export const renderWithAuth = (
  ui: React.ReactElement,
  user = createTestUser()
) => {
  return renderWithProviders(
    <AuthContext.Provider value={{ user, isAuthenticated: true }}>
      {ui}
    </AuthContext.Provider>
  );
};
```

### 3. テストの構造化
```typescript
describe('Feature: User Management', () => {
  describe('When user is authenticated', () => {
    beforeEach(() => {
      // 認証されたユーザーの状態を設定
    });

    describe('And user has admin role', () => {
      it('should allow creating new users', () => {
        // テストケース
      });

      it('should allow deleting users', () => {
        // テストケース
      });
    });

    describe('And user has regular role', () => {
      it('should not allow creating new users', () => {
        // テストケース
      });
    });
  });

  describe('When user is not authenticated', () => {
    it('should redirect to login page', () => {
      // テストケース
    });
  });
});
```
