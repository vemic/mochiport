# 🚀 VS Code ビルド設定 - クイックスタートガイド

## 📦 初回セットアップ

### 1. 推奨拡張機能をインストール

```powershell
# VS Codeでコマンドパレットを開く (Ctrl+Shift+P)
# "Extensions: Show Recommended Extensions" を実行
# 推奨された拡張機能をすべてインストール
```

### 2. ワークスペースファイルを開く

```powershell
# mochiport.code-workspace ファイルをVS Codeで開く
code mochiport.code-workspace
```

### 3. 依存関係をインストール

```powershell
yarn install
```

## ⚡ 日常的な開発ワークフロー

### 🎯 最も使用頻度の高いタスク

| タスク                | ショートカット | 説明                                  |
| --------------------- | -------------- | ------------------------------------- |
| **開発環境起動**      | `Ctrl+Shift+D` | フロントエンド+バックエンドを同時起動 |
| **全体ビルド**        | `Ctrl+Shift+B` | プロジェクト全体をビルド              |
| **全テスト実行**      | `Ctrl+Shift+T` | 全テストを実行                        |
| **クリーン&リビルド** | `Ctrl+Alt+R`   | キャッシュクリア後にリビルド          |

### 🔧 個別コンポーネントのビルド

| タスク                   | ショートカット | 説明                    |
| ------------------------ | -------------- | ----------------------- |
| **フロントエンドビルド** | `Ctrl+Alt+F`   | Next.jsアプリのビルド   |
| **バックエンドビルド**   | `Ctrl+Alt+B`   | Azure Functionsのビルド |
| **共有パッケージビルド** | `Ctrl+Alt+S`   | 共有ライブラリのビルド  |

### 🧪 テストとデバッグ

| タスク                   | ショートカット            | 説明                     |
| ------------------------ | ------------------------- | ------------------------ |
| **バックエンドテスト**   | `Ctrl+Alt+T`              | バックエンドのみテスト   |
| **テストウォッチ**       | `Ctrl+Alt+W`              | ファイル変更監視でテスト |
| **フルスタックデバッグ** | `F5` → "Debug Full Stack" | 両方同時デバッグ         |

### 🛠️ コード品質チェック

| タスク         | ショートカット     | 説明                       |
| -------------- | ------------------ | -------------------------- |
| **リント実行** | `Ctrl+Shift+L`     | ESLintでコード品質チェック |
| **コード整形** | `Ctrl+Shift+F`     | Prettierで自動整形         |
| **型チェック** | タスクメニューから | TypeScript型チェック       |

## 📋 タスクメニューの使い方

### アクセス方法

1. `Ctrl+Shift+P` でコマンドパレットを開く
2. `Tasks: Run Task` を選択
3. 実行したいタスクを選択

### 利用可能なタスク一覧

- **Start Full Development Environment** - 開発環境を一括起動
- **Build All** - 全コンポーネントをビルド
- **Build Frontend/Backend/Shared** - 個別ビルド
- **Test All/Backend** - テスト実行
- **Clean All** - ビルド成果物を削除
- **Quick Build & Test** - ビルド→テストを連続実行
- **Clean & Rebuild** - クリーン→リビルドを連続実行

## 🐛 デバッグ設定

### 利用可能なデバッグ設定

1. **Debug Frontend (Next.js)** - Next.jsのデバッグ
2. **Debug Backend (Azure Functions)** - バックエンドのデバッグ
3. **Debug Jest Tests** - テストのデバッグ
4. **Debug Full Stack** - フロントエンド+バックエンド同時デバッグ

### デバッグの開始

1. `F5` でデバッグを開始
2. または `Ctrl+Shift+D` でDebugビューを開き設定を選択

## 🔥 パフォーマンス最適化

### TurboRepoの活用

- **並行処理**: 複数パッケージの並行ビルド
- **キャッシュ機能**: 変更されていないパッケージはスキップ
- **依存関係の自動解決**: 正しい順序でビルド実行

### ファイル監視の最適化

- `node_modules`, `dist`, `.next`, `.turbo` は監視対象外
- 大量のファイル変更による負荷を回避

## 📊 よくある問題と解決方法

### ❌ ビルドエラーが発生した場合

1. `Clean & Rebuild` タスクを実行
2. 依存関係の問題があれば `yarn install` を実行
3. 型エラーは `Type Check All` で詳細確認

### ❌ ESLintエラーが発生した場合

1. 保存時に自動修正される設定になっています
2. 手動で修正したい場合は `Format Code` タスクを実行

### ❌ パフォーマンスが遅い場合

1. VS Codeを再起動
2. `Clean All` でキャッシュをクリア
3. 不要な拡張機能を無効化

## 🎉 開発効率向上のTips

### 自動化機能を活用

- **保存時自動整形**: ファイル保存時にPrettierが自動実行
- **自動インポート**: 未定義の型やモジュールを自動インポート
- **リアルタイム型チェック**: 編集中に型エラーをリアルタイム表示

### キーボードショートカットを覚える

- 最も使用頻度の高い4つのショートカットを覚えるだけで効率大幅アップ
- カスタマイズも可能（`.vscode/keybindings.json`）

### ワークスペース機能を活用

- 複数のフォルダを効率的に管理
- プロジェクト固有の設定が自動適用

この設定により、モノレポ構造での効率的な開発が可能になります！
