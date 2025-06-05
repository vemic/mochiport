# VS Code ビルド設定ガイド

このプロジェクトは効率的な開発のために、包括的なVS Code設定が構成されています。

## 🚀 クイックスタート

### 1. 推奨拡張機能のインストール

- `Ctrl+Shift+P` でコマンドパレットを開く
- `Extensions: Show Recommended Extensions` を実行
- 推奨された拡張機能をすべてインストール

### 2. 開発環境の起動

- `Ctrl+Shift+P` でコマンドパレットを開く
- `Tasks: Run Task` を選択
- `Start Full Development Environment` を実行

## 📝 利用可能なタスク

### ビルドタスク

- **Build All** (`Ctrl+Shift+P` → `Tasks: Run Build Task`) - 全体ビルド
- **Build Frontend** - フロントエンドのみビルド
- **Build Backend** - バックエンドのみビルド
- **Build Shared** - 共有パッケージのみビルド

### 開発タスク

- **Start Full Development Environment** - 全体の開発環境を起動
- **Start Frontend Dev** - フロントエンド開発サーバーのみ起動
- **Start Backend Dev** - バックエンド開発サーバーのみ起動

### テストタスク

- **Test All** (`Ctrl+Shift+P` → `Tasks: Run Test Task`) - 全テスト実行
- **Test Backend** - バックエンドテストのみ実行
- **Test Backend Watch** - バックエンドテストをウォッチモードで実行

### メンテナンスタスク

- **Clean All** - 全ビルド成果物を削除
- **Type Check All** - TypeScript型チェック
- **Lint All** - ESLintによるコード検査
- **Format Code** - Prettierによるコード整形
- **Install Dependencies** - 依存関係のインストール

### 複合タスク

- **Quick Build & Test** - 型チェック → リント → ビルド → テストを順次実行
- **Clean & Rebuild** - クリーンアップ → 依存関係インストール → ビルドを順次実行

## 🐛 デバッグ設定

### 利用可能なデバッグ設定

1. **Debug Frontend (Next.js)** - Next.jsアプリケーションのデバッグ
2. **Debug Backend (Azure Functions)** - Azure Functionsのデバッグ
3. **Debug Jest Tests** - Jestテストのデバッグ
4. **Debug Current Jest Test** - 現在開いているテストファイルのデバッグ
5. **Debug Full Stack** - フロントエンドとバックエンドを同時にデバッグ

### デバッグの開始方法

- `F5` でデバッグを開始
- または `Ctrl+Shift+D` でDebugビューを開き、設定を選択して実行

## ⚙️ 自動化された機能

### 保存時の自動実行

- **ESLint自動修正** - 保存時にリントエラーを自動修正
- **Import整理** - 保存時にimport文を自動整理
- **Prettier整形** - 保存時にコードを自動整形

### TypeScript設定

- **自動インポート** - 未定義の型やモジュールを自動インポート
- **パス補完** - ファイルパスの自動補完
- **リファクタリング支援** - ファイル移動時のインポート自動更新

## 🎯 効率的な開発フロー

### 日常的な開発

1. `Start Full Development Environment` タスクで開発環境を起動
2. コード編集中は自動保存とリアルタイム型チェックが動作
3. 保存時に自動的にESLint修正とコード整形が実行

### デプロイ前のチェック

1. `Quick Build & Test` タスクで一括チェック
2. 問題があれば個別のタスクで詳細確認
3. すべて成功したらデプロイ準備完了

### トラブルシューティング

1. `Clean & Rebuild` タスクでクリーンビルド
2. 依存関係の問題があれば `Install Dependencies` タスクを実行
3. 型エラーは `Type Check All` タスクで詳細確認

## 🔧 VS Code 設定管理

### 📁 設定ファイルの構成

#### 🤝 チーム共有設定 (Git管理対象)

これらのファイルはプロジェクトの一部としてGitで管理され、チーム全体で共有されます：

- **`.vscode/settings.json`** - プロジェクト共通のエディタ設定
- **`.vscode/tasks.json`** - ビルド・テスト・開発タスク
- **`.vscode/launch.json`** - デバッグ設定
- **`.vscode/extensions.json`** - 推奨拡張機能リスト
- **`.vscode/keybindings.json`** - プロジェクト用ショートカット
- **`*.code-workspace`** - ワークスペース設定

#### 👤 個人設定 (Git管理対象外)

これらのファイルは個人の好みに応じて設定し、Gitでは管理されません：

- **`.vscode/settings.json.user`** - 個人のエディタ設定
- **`.vscode/*.log`** - ログファイル

### ⚙️ 個人設定のカスタマイズ

個人的な設定を変更したい場合は、`.vscode/settings.json.user` ファイルを編集してください：

```json
{
  // フォントサイズの変更
  "editor.fontSize": 14,
  
  // テーマの変更
  "workbench.colorTheme": "Visual Studio Dark",
  
  // ターミナルフォントサイズ
  "terminal.integrated.fontSize": 12,
  
  // ミニマップの表示/非表示
  "editor.minimap.enabled": false
}
```

### 🔄 設定の同期

#### チーム設定の更新
チーム設定が更新された場合：

1. `git pull` で最新の設定を取得
2. VS Codeを再起動（推奨）
3. 新しい推奨拡張機能がある場合はインストール

#### 設定の優先順位
優先順位: 個人設定 (`.vscode/settings.json.user`) > チーム設定 (`.vscode/settings.json`) > ユーザー設定

## カスタマイズ

### タスクの追加

`.vscode/tasks.json` を編集して、プロジェクト固有のタスクを追加できます。

### 設定の調整

`.vscode/settings.json` でエディタやツールの動作をカスタマイズできます。

### デバッグ設定の追加

`.vscode/launch.json` で新しいデバッグ設定を追加できます。

## 📊 パフォーマンス最適化

### ファイル監視の除外

- `node_modules`, `dist`, `.next`, `.turbo` などは監視対象外
- 大量のファイル変更による重いI/Oを回避

### TypeScript設定最適化

- ワークスペース全体での型チェック
- 相対パスでのモジュール解決
- 自動インポートの最適化

### 並列処理

- TurboRepoによる効率的なビルドキャッシュ
- 複数タスクの並列実行対応

この設定により、モノレポ構造での効率的な開発が可能になります。
