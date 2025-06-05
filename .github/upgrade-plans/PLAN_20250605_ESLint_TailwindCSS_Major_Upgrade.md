# ESLint 9 & Tailwind CSS v4 メジャーアップグレード計画書

**作成日**: 2025年06月05日  
**対象ライブラリ**: ESLint 8.57.1 → 9.28.0, Tailwind CSS 3.4.17 → 4.1.8  
**実施期間**: 2-4日間  
**リスクレベル**: 中〜高

## 📋 **概要**

現在のUIが小規模なうちに、メジャーバージョンアップデートを実施し、将来の開発効率と保守性を向上させる戦略的な更新を行います。

## 🎯 **更新目標**

### ESLint 9の主要改善点

- **フラットconfig**: より直感的で管理しやすい設定形式
- **パフォーマンス向上**: 約20-30%の高速化
- **TypeScript統合強化**: より精密な型チェック
- **モダンJavaScript対応**: ES2024構文サポート

### Tailwind CSS v4の主要改善点

- **新エンジン**: Lightning CSS採用で高速化
- **CSS-in-JS統合**: より柔軟な動的スタイリング
- **ファイルサイズ削減**: 約40%の軽量化
- **開発体験向上**: より高速なHMR

## 📊 **現状分析**

### 現在の設定状況

```
mochiport/
├── packages/eslint-config/
│   ├── index.js (レガシー形式)
│   └── package.json
├── frontend/
│   ├── .eslintrc.json (レガシー形式)
│   ├── tailwind.config.js (v3形式)
│   └── postcss.config.js
└── backend/
    └── .eslintrc.js (レガシー形式)
```

### 依存関係

- **ESLint関連**: 8.57.1, @typescript-eslint/\* 6.21.0
- **Tailwind関連**: 3.4.17, PostCSS 8.5.1
- **影響範囲**: 全ワークスペース

## ⚠️ **リスク分析**

### 高リスク要素

1. **ESLint フラットconfig移行**: 設定ファイル全面書き換え
2. **Tailwind v4 CSS変数**: 既存スタイルの互換性問題
3. **VS Code設定**: ESLint拡張機能の動作変更
4. **CI/CD**: lintタスクの動作変更

### 低リスク要素

- **UI規模**: 現在のコンポーネント数が少ない
- **型安全性**: TypeScript strictモードで保護
- **テスト**: 既存テストで基本動作保証

## 🚀 **段階的実施計画**

### **Phase 1: ESLint 9 基盤準備（Day 1）**

#### Step 1.1: 依存関係更新

```bash
# 共有ESLint設定更新
yarn workspace @mochiport/eslint-config add eslint@^9.28.0
yarn workspace @mochiport/eslint-config add @typescript-eslint/eslint-plugin@^8.33.1
yarn workspace @mochiport/eslint-config add @typescript-eslint/parser@^8.33.1

# 各ワークスペース更新
yarn workspace @mochiport/frontend add -D eslint@^9.28.0
yarn workspace @mochiport/backend add -D eslint@^9.28.0
```

#### Step 1.2: フラットconfig作成

- `packages/eslint-config/eslint.config.js` 新規作成
- モノレポ対応設定の実装
- TypeScript統合設定

#### Step 1.3: 動作検証

```bash
yarn workspace @mochiport/eslint-config lint --dry-run
```

### **Phase 2: Backend ESLint移行（Day 1-2）**

#### Step 2.1: 設定ファイル移行

- `backend/.eslintrc.js` → `backend/eslint.config.js`
- Node.js環境特化設定
- 既存ルールの移行

#### Step 2.2: 動作確認

```bash
yarn workspace @mochiport/backend lint
yarn workspace @mochiport/backend type-check
```

#### Step 2.3: CI/CD確認

```bash
yarn lint # 全体リント確認
```

### **Phase 3: Frontend ESLint移行（Day 2）**

#### Step 3.1: 設定ファイル移行

- `frontend/.eslintrc.json` → `frontend/eslint.config.js`
- Next.js特化設定
- React 19対応ルール

#### Step 3.2: VS Code設定更新

- `.vscode/settings.json` 更新
- ESLint拡張機能設定調整

#### Step 3.3: 動作確認

```bash
yarn workspace @mochiport/frontend lint
yarn workspace @mochiport/frontend build
```

### **Phase 4: Tailwind CSS v4 移行（Day 3）**

#### Step 4.1: 依存関係更新

```bash
yarn workspace @mochiport/frontend add -D tailwindcss@^4.1.8
yarn workspace @mochiport/frontend add -D @tailwindcss/postcss@^4.1.8
```

#### Step 4.2: 設定ファイル移行

- `postcss.config.js` 更新
- `tailwind.config.js` → CSS内設定移行
- `globals.css` 更新

#### Step 4.3: スタイル検証

- 各UIコンポーネント表示確認
- ダークモード動作確認
- レスポンシブ動作確認

### **Phase 5: 統合検証・最終確認（Day 4）**

#### Step 5.1: 全体動作確認

```bash
yarn build # 全体ビルド
yarn test # 全体テスト
yarn type-check # 型チェック
```

#### Step 5.2: 開発環境確認

```bash
yarn dev # 開発サーバー起動確認
```

#### Step 5.3: パフォーマンス検証

- ビルド時間測定
- HMR速度確認
- バンドルサイズ確認

## 🔍 **検証基準**

### 必須クリア条件

- [ ] 全ワークスペースでlintエラーなし
- [ ] 全ワークスペースでビルド成功
- [ ] 全テストがパス
- [ ] 開発サーバーが正常起動
- [ ] VS Code ESLint拡張機能が正常動作

### パフォーマンス目標

- [ ] ESLint実行時間: 現状比20%短縮
- [ ] Tailwind HMR: 現状比30%高速化
- [ ] ビルド時間: 現状維持または改善
- [ ] バンドルサイズ: 現状比10%削減

## 🛠️ **トラブルシューティング計画**

### ESLint移行でのトラブル

1. **設定ファイル認識エラー**

   - フラットconfig形式の確認
   - VS Code再起動

2. **ルール移行エラー**

   - 段階的ルール適用
   - レガシールールの一時無効化

3. **TypeScript統合エラー**
   - parserOptions確認
   - tsconfig.jsonパス確認

### Tailwind移行でのトラブル

1. **PostCSS設定エラー**

   - プラグイン順序確認
   - バージョン互換性確認

2. **CSS変数問題**

   - カスタムプロパティ移行
   - 段階的スタイル確認

3. **コンポーネント表示崩れ**
   - クラス名マッピング確認
   - 個別コンポーネント修正

## 💾 **ロールバック計画**

### 緊急時のロールバック手順

1. **Git commit単位でのロールバック**

   ```bash
   git revert [commit-hash]
   ```

2. **package.json復元**

   ```bash
   git checkout HEAD~1 -- package.json yarn.lock
   yarn install --frozen-lockfile
   ```

3. **設定ファイル復元**
   ```bash
   git checkout HEAD~1 -- .eslintrc.* eslint.config.js tailwind.config.js
   ```

## 📈 **成功指標**

### 定量的指標

- ESLint実行時間短縮率
- Tailwind HMR高速化率
- バンドルサイズ削減率
- ビルド時間変化率

### 定性的指標

- 開発体験の向上
- エラーメッセージの明確性
- VS Code統合の安定性
- 設定ファイルの可読性

## 📝 **実施後の文書化**

### 作成予定のChangelog

- `CHANGELOG_20250605_012_ESLint_9_Migration.md`
- `CHANGELOG_20250605_013_TailwindCSS_4_Migration.md`

### 更新予定の文書

- `README.md` - 新しい要件記載
- `.github/instructions/general.instructions.md` - 技術スタック更新
- VS Code設定ガイド

## ⏰ **実施スケジュール**

| Day | フェーズ  | 主な作業                | 検証項目     |
| --- | --------- | ----------------------- | ------------ |
| 1   | Phase 1-2 | ESLint基盤・Backend移行 | Lint・Build  |
| 2   | Phase 3   | Frontend ESLint移行     | 全体Lint     |
| 3   | Phase 4   | Tailwind CSS移行        | UI確認       |
| 4   | Phase 5   | 統合検証・文書化        | 全機能テスト |

## 🎯 **完了判定**

この計画書に基づいた実施が完了し、全ての検証基準をクリアした時点で、mochiportプロジェクトのメジャーライブラリ更新を完了とします。

---

**承認者**: プロジェクトオーナー  
**実施責任者**: GitHub Copilot  
**レビュー予定日**: 各フェーズ完了時
