# Changelogs Directory

このディレクトリには、プロジェクトで実施された重要なアップグレードや変更の履歴を記録しています。

## 命名規則

```
CHANGELOG_YYYYMMDD_NNN_English_Change_Title.md
```

- **YYYYMMDD**: 変更実施日（例: 20250605）
- **NNN**: 同日内の実施順序を示す3桁連番（例: 001, 002, 003...）
- **English_Change_Title**: 英語での変更タイトル（スペースはアンダースコアに置換）

### 連番の付与ルール

- 同日に複数の変更がある場合、実施順序に応じて001から順に付与
- 時系列の把握と依存関係の理解を容易にする
- 単独の変更の場合でも001を付与することを推奨

## 現在の履歴

### 2025年6月5日

- `CHANGELOG_20250605_001_Node_js_Version_Upgrade.md` - Node.js v22.16.0 LTSへのアップグレード
- `CHANGELOG_20250605_002_Library_Upgrade_Strategy_Completion.md` - ライブラリアップグレード戦略の完了
- `CHANGELOG_20250605_003_ESLint_Configuration_Setup.md` - ESLint設定構築とワークスペース対応
- `CHANGELOG_20250605_004_Final_Project_Completion_Report.md` - 包括的アップグレード戦略完了報告
- `CHANGELOG_20250605_005_Complete_Project_Validation_Report.md` - プロジェクト全体の最終検証レポート
- `CHANGELOG_20250605_006_Update_Project_Config_Documentation.md` - プロジェクト構成ドキュメントの更新
- `CHANGELOG_20250605_007_Copilot_Instructions_Optimization.md` - Copilot指示ドキュメント最適化と判断基準明確化
- `CHANGELOG_20250605_008_Copilot_Instructions_Restructuring.md` - Copilot指示書のベストプラクティス準拠再構築
- `CHANGELOG_20250605_009_Critical_Gitignore_Fix.md` - **[緊急修正]** .gitignoreによる重要ソースコード除外問題の解決

## 関連ドキュメント

- `../.github/instructions/` - GitHub Copilot専用指示書ディレクトリ（general, coding-standards, react, testing）
- `../.github/LIBRARY_UPGRADE_STRATEGY.md` - ライブラリアップグレードの戦略ドキュメント
- `../.github/scalable-project-config.md` - プロジェクト設定のスケーラビリティ戦略

## ガイドライン

1. **重要な変更は必ず記録** - ライブラリのメジャーバージョンアップ、Node.js版数変更、アーキテクチャ変更など
2. **影響範囲を明記** - 変更が与える影響（互換性、パフォーマンス、セキュリティなど）
3. **検証結果を含める** - テスト結果、ビルド状況、パフォーマンス測定など
4. **回復手順を記載** - 問題が発生した場合のロールバック手順
