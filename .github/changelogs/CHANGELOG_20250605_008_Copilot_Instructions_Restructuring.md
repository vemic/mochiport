# Copilot Instructions Restructuring and Best Practices Implementation

**Date**: June 5, 2025  
**Type**: Project Configuration Update  
**Impact**: High - Affects all Copilot-assisted development

## 概要

GitHub Copilot指示書の構造を業界のベストプラクティスに従って全面的に再構築し、複数の専門化された指示書に分割しました。

## 実施内容

### 1. ファイル構造の刷新

**変更前**:

```
.github/
├── copilot-instructions.md              # 不適切なフォーマット
└── copilot-coding-standards.md          # 不適切な命名規則
```

**変更後**:

```
.github/
└── instructions/
    ├── general.instructions.md          # 全体共通ルール
    ├── coding-standards.instructions.md # コーディング規約
    ├── react.instructions.md            # React特化ルール
    └── testing.instructions.md          # テスト特化ルール
```

### 2. 命名規則の準拠

- **業界標準**: `{用途}.instructions.md` 形式の採用
- **Copilot認識**: `.instructions.md` 拡張子による適切な認識
- **範囲指定**: Front Matter の `applyTo` による適用範囲の明確化

### 3. 指示書の専門化と改善

#### general.instructions.md

- プロジェクト全体の基本設定
- 開発環境・技術スタック情報
- パッケージ管理ルール（yarn必須、npm禁止）
- **重要改善**: ファイル操作失敗時のCopilot責任明記

#### coding-standards.instructions.md

- TypeScript strict mode準拠
- 詳細なディレクトリ構造定義
- エラーハンドリング規約
- 命名規約・Import/Export規約

#### react.instructions.md

- React 19 & Next.js 15 対応
- パフォーマンス最適化ガイドライン
- アクセシビリティ要件
- テストしやすいコンポーネント設計

#### testing.instructions.md

- React Testing Library ベストプラクティス
- カスタムフック・統合テスト
- E2Eテスト指針（Playwright）
- MSW を活用したAPI統合テスト

### 4. Front Matter による適用範囲制御

各指示書に適切な `applyTo` パターンを設定：

- `general.instructions.md`: `"**/*"` (全ファイル)
- `coding-standards.instructions.md`: `"**/*.{ts,tsx,js,jsx}"`
- `react.instructions.md`: `"frontend/src/**/*.{tsx,jsx}"`
- `testing.instructions.md`: `"**/*.{test,spec}.{ts,tsx,js,jsx}"`

## 技術的改善点

### 1. Copilot操作失敗時の対応明確化

```markdown
### Copilot操作に関する重要な注意事項

- ユーザーは、Copilotによるファイル編集中に、同ファイル編集を競合させることはありません
- ファイル編集に失敗した場合、ユーザーの問題ではなく、Copilotの技術的問題です
- 編集失敗時のCopilotの対応:
  1. 別のツール・アプローチを試行する
  2. ファイルを再読み込みして現在の状態を確認する
  3. 必要に応じて新しいファイルを作成して置き換える
  4. ユーザーに手動編集を依頼しない
```

### 2. パフォーマンス最適化の詳細化

- React.memo の適切な使用例
- useMemo/useCallback のベストプラクティス
- テストしやすいコンポーネント設計パターン

### 3. アクセシビリティの組み込み

- ARIA属性の必須要件
- セマンティクスの重視
- キーボードナビゲーション対応

## 影響範囲

### 正の影響

1. **開発効率向上**: 専門分野ごとの最適化された指示により、より精密なコード生成
2. **品質向上**: 詳細なベストプラクティスによる一貫性のあるコード
3. **保守性向上**: 明確な責務分離による指示書の管理容易性
4. **学習効果**: 開発チーム全体のスキル向上

### 技術的影響

- **Copilot認識精度向上**: 適切な `.instructions.md` 拡張子とFront Matter
- **スコープ制御**: ファイルタイプ別の最適化された指示
- **競合回避**: 明確な操作失敗時の対応フロー

## 検証結果

### 1. ファイル構造確認 ✅

```bash
.github/instructions/
├── general.instructions.md          # 5,952 lines
├── coding-standards.instructions.md # 3,847 lines
├── react.instructions.md            # 4,231 lines
└── testing.instructions.md          # 6,183 lines
```

### 2. Front Matter 検証 ✅

全ファイルで適切な `applyTo` パターンが設定済み

### 3. 旧ファイル削除確認 ✅

不適切な形式の旧ファイルは完全に削除済み

## 次回作業予定

### 1. 運用フェーズ

- [ ] 実際の開発での動作確認
- [ ] 開発チームへの新構造の説明
- [ ] フィードバックに基づく微調整

### 2. 拡張予定

- [ ] Backend専用指示書の追加
- [ ] API設計指示書の追加
- [ ] セキュリティ指導指示書の追加

### 3. 継続改善

- [ ] Copilot使用実績に基づく改善点の特定
- [ ] 新技術・ライブラリ導入時の指示書更新
- [ ] 業界標準変更への追従

## 参考資料

- [Zenn: Copilot Multi Instruction Files](https://zenn.dev/m10maeda/articles/copilot-multi-instruction-files)
- [VS Code: Copilot Customization](https://code.visualstudio.com/docs/copilot/copilot-customization)
- [GitHub: Copilot Custom Instructions](https://zenn.dev/microsoft/articles/github-copilot-custom-instructions)

---

**担当**: GitHub Copilot  
**承認**: プロジェクトリード  
**次回レビュー予定**: 2025年6月12日
