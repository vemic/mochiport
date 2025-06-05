# 📋 チーム向け VS Code 設定シェアガイド

## 🎯 概要

このプロジェクトでは、チーム全体で統一された開発環境を実現するため、VS Code の設定を Git で管理しています。

## 📁 管理される設定ファイル

### ✅ Git管理対象（チーム共有）
```
.vscode/
├── settings.json        # プロジェクト共通設定
├── tasks.json          # ビルド・テスト・開発タスク
├── launch.json         # デバッグ設定
├── extensions.json     # 推奨拡張機能
├── keybindings.json    # プロジェクト用ショートカット
└── README.md           # 設定ガイド

mochiport.code-workspace # ワークスペース設定
VSCODE_SETUP.md         # クイックスタートガイド
```

### ❌ Git管理対象外（個人設定）
```
.vscode/
├── settings.json.user  # 個人設定（フォント、テーマなど）
└── *.log              # ログファイル
```

## 🚀 新メンバーのオンボーディング

### 1. リポジトリのクローン
```powershell
git clone <repository-url>
cd mochiport
```

### 2. ワークスペースを開く
```powershell
code mochiport.code-workspace
```

### 3. 推奨拡張機能のインストール
VS Codeが自動的に通知を表示するので、「Install All」をクリック

### 4. 開発環境の起動
```
Ctrl+Shift+D → "Start Full Development Environment" を実行
```

## 🔧 個人設定のカスタマイズ

フォントサイズやテーマなど、個人の好みに応じた設定は `.vscode/settings.json.user` ファイルで行います：

```json
{
  "editor.fontSize": 14,
  "workbench.colorTheme": "Visual Studio Dark",
  "editor.minimap.enabled": false
}
```

## 📝 設定更新の手順

### チーム設定を更新する場合

1. **設定ファイルを編集**
   ```
   .vscode/settings.json, tasks.json, launch.json など
   ```

2. **変更をコミット**
   ```powershell
   git add .vscode/
   git commit -m "update: VS Code設定を更新"
   git push
   ```

3. **チームに通知**
   - Slack/Teams で設定更新を通知
   - 必要に応じて新しい拡張機能のインストールを案内

### チーム設定の同期

他のメンバーが設定を更新した場合：

1. **最新の設定を取得**
   ```powershell
   git pull
   ```

2. **VS Code を再起動**（推奨）

3. **新しい拡張機能をインストール**（必要に応じて）

## ⚠️ 注意事項

### ✅ 適切な設定管理
- **機密情報は含めない** - APIキーや認証情報は設定ファイルに記載しない
- **OS固有設定は避ける** - Windows/Mac/Linux で動作する設定のみ
- **パフォーマンスを考慮** - 重い設定は個人設定で調整

### ❌ やってはいけないこと
- `.vscode/settings.json.user` をコミットしない
- 個人的な設定を `.vscode/settings.json` に追加しない
- OS固有のパス設定を共通設定に含めない

## 🆘 トラブルシューティング

### 設定が反映されない
1. VS Code を再起動
2. ワークスペースファイルが正しく開かれているか確認
3. 個人設定ファイルで上書きされていないか確認

### 拡張機能が動作しない
1. 推奨拡張機能がインストールされているか確認
2. 拡張機能の設定を確認
3. VS Code を再起動

### タスクが実行できない
1. 依存関係がインストールされているか確認（`yarn install`）
2. PowerShell の実行ポリシーを確認
3. ワークスペースのパス設定を確認

## 📊 メリット

### チーム全体
- **統一された開発環境** - 全員が同じ設定で開発
- **効率的なオンボーディング** - 新メンバーの環境構築が簡単
- **一貫したコード品質** - 自動整形・リントの統一

### 個人
- **カスタマイズ性の維持** - 個人設定で好みに調整可能
- **生産性向上** - 最適化されたタスクとショートカット
- **学習効果** - チームのベストプラクティスを共有

この設定管理により、効率的で一貫性のある開発環境をチーム全体で維持できます！
