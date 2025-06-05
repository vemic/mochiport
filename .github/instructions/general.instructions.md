---
applyTo: "**/*"
---

# General Instructions for GitHub Copilot

## 基本開発環境

### 開発環境

- **プロジェクト名**: mochiport
- **アーキテクチャ**: Frontend/Backend分離型モノレポ
- **シェル**: PowerShell（コマンド連結は `;` を使用）
- **パッケージ管理**: Turborepo + yarn@1.22.19
- **Node.js**: v22.16.0 LTS (nvm管理)

### 技術スタック

- **TypeScript**: 5.7.2
- **React**: 19.0.0
- **Next.js**: 15.0.0
- **Node.js Backend**: AI機能カプセル化サーバ
- **Testing Library**: React 19対応版 (16.3.0)

### プロジェクト構造

```
mochiport/
├── frontend/          # Next.js フロントエンド
├── backend/           # Node.js バックエンドサーバ（AI機能カプセル化）
├── shared/            # 共有コード・型定義
├── packages/          # 再利用可能パッケージ（eslint-config, tsconfig, ui-components）
├── .vscode/           # VS Code設定
├── .github/           # GitHub設定・Changelogs
├── turbo.json         # Turborepo設定
└── package.json       # ルート設定
```

## コード生成時の必須要件

- 全ての非同期処理に適切なエラーハンドリングを実装
- TypeScript strict モードに準拠した型定義
- コンポーネントにはDisplayNameを必須設定
- カスタムフックには適切な依存配列を設定
- API呼び出しには適切なキャッシュ戦略を実装
- **ファイルパスは常にプロジェクトルートからの相対パスで記載する**（例：`frontend/src/components/ui/Button.tsx`）

## 指示書継続改善ルール

### 指示書デグレード防止

- **この指示書は継続的に改善・更新される**
- **重要なルールは削除せず、必要に応じて統合・簡潔化**
- **変更時は必ずChangelogで変更理由と内容を記録**
- **最適化時も機能・ルールの欠失を防ぐ**

### Copilot自身による継続的更新責任

- **会話中の指摘対応**: ユーザから指示書の不備を指摘された場合、Copilot自身が指示書を即座に修正
- **更新判断**: 技術仕様変更、プロジェクト設定変更、開発プロセス改善提案があった場合は自動的に指示書更新
- **変更記録**: 全ての更新は対応するChangelogで変更理由・内容・影響範囲を明記

### 実装時のファイルパス記載ルール

- **相対パス必須**: プロジェクトルートからの相対パスで記載
- **例**: `frontend/src/components/ui/Button.tsx`
- **絶対パス禁止**: `c:\mochiport\...` 形式は使用禁止

## ファイル操作について

### Copilot操作に関する重要な注意事項

- **ユーザーは、Copilotによるファイル編集中に、同ファイル編集を競合させることはありません**
- **ファイル編集に失敗した場合、ユーザーの問題ではなく、Copilotの技術的問題です**
- **編集失敗時のCopilotの対応**:
  1. 別のツール・アプローチを試行する
  2. ファイルを再読み込みして現在の状態を確認する
  3. 必要に応じて新しいファイルを作成して置き換える
  4. ユーザーに手動編集を依頼しない

## パッケージ管理とターミナル操作

### パッケージマネージャー

- **使用ツール**: yarn@1.22.19 （**npmは使用禁止**）
- **理由**: プロジェクトにyarn.lockが存在するため、npm使用時に依存関係が破綻する
- **インストール**: `yarn install --frozen-lockfile`
- **追加**: `yarn add <package-name>`
- **ワークスペース操作**: `yarn workspace @mochiport/frontend add <package-name>`

### ターミナルコマンド

- **PowerShell専用**: コマンド連結は `;` を使用（`&&` は使用禁止）
- **実行例**: `yarn install ; yarn build ; yarn test`
- **背景プロセス**: VS Code タスクまたは `run_in_terminal` ツール使用

## Changelog作成・更新ルール

### Changelog管理必須事項

- **重要な変更は必ずChangelogを作成または更新する**
- **場所**: `.github/changelogs/` ディレクトリ
- **対象変更**:
  - ライブラリのメジャーバージョンアップ
  - Node.js版数変更
  - アーキテクチャ変更
  - プロジェクト設定変更
  - 開発環境構成変更

### Changelog新規作成 vs 更新の判断基準

- **新規作成**: 同日内に関連するChangelogが存在しない場合
- **更新**: 同日内に同テーマのChangelogが存在する場合、またはChangelogが不完全で追記が必要な場合
- **判断指標**: 関連性（技術スタック、同一ライブラリ、同一作業フロー）と時間的近接性（同日内）

### 命名規則

```
CHANGELOG_YYYYMMDD_NNN_English_Change_Title.md
```

- **YYYYMMDD**: 変更実施日（例: 20250605）
- **NNN**: 同日内の実施順序を示す3桁連番（例: 001, 002, 003）
- **English_Change_Title**: 英語での変更タイトル（スペースはアンダースコアに置換）

### 連番管理の重要ルール

- **Changelog作成前に必ず既存ファイルを確認し、正しい連番を付与する**
- **同日内の最大番号+1を使用する**（例：007まで存在する場合は008を使用）
- **README.mdのリストと連番の整合性を必ず確認する**
- **作成後にREADME.mdの履歴リストを更新する**

### Changelog必須内容

1. **影響範囲を明記**: 変更が与える影響（互換性、パフォーマンス、セキュリティなど）
2. **検証結果を含める**: テスト結果、ビルド状況、パフォーマンス測定など
3. **技術的詳細**: 変更前後の比較、設定変更内容
4. **次回作業予定**: 未完了項目や継続課題

### Changelog記載言語

- **日本語必須**: すべてのChangelogは日本語で記載する
- **技術用語**: 必要に応じて英語技術用語を併記可能
- **コード例**: コードブロックは元の言語のまま記載

### Changelog更新時の手順

1. 既存Changelogがある場合は追記更新
2. `.github/changelogs/README.md` のリストに新規追加
3. 変更内容を時系列で整理
4. 関連ドキュメントへのリンクを含める

## 拡張性戦略

### 段階的スケーリング戦略

- **Phase 1 (1-3人)**: useState + カスタムフック
- **Phase 2 (3-10人)**: Zustand + Context API
- **Phase 3 (10人+)**: マイクロフロントエンド + 独立デプロイ

### 責務分離アーキテクチャ

- **Presentation Layer**: UIコンポーネント（状態なし）
- **Container Layer**: 状態管理とビジネスロジック接続
- **Service Layer**: ビジネスロジックの実装
- **Repository Layer**: データアクセス抽象化
- **Infrastructure Layer**: 外部サービス統合

## 詳細な技術ルール参照

詳細なコーディング規約については `coding-standards.instructions.md` を参照してください。
