# Performance Monitoring Workflow Guide

## 概要
このガイドでは、VS CodeとNode.jsのメモリリーク問題を解決した後の継続的なパフォーマンス監視ワークフローについて説明します。

## 利用可能な監視ツール

### 1. クイック パフォーマンス チェック
```bash
# バッチファイルで簡単チェック
./performance-check.bat

# または VS Code タスクから実行
# Ctrl+Shift+P → "Tasks: Run Task" → "Performance Check"
```

### 2. 継続的なパフォーマンス監視
```bash
# PowerShellスクリプトで継続監視
powershell -ExecutionPolicy Bypass -File .\performance-monitor.ps1

# または VS Code タスクから実行
# Ctrl+Shift+P → "Tasks: Run Task" → "Start Performance Monitor"
```

### 3. JavaScript メモリ監視
```bash
# Node.jsベースの詳細監視
node memory-monitor-fixed.js

# または VS Code タスクから実行
# Ctrl+Shift+P → "Tasks: Run Task" → "Memory Monitor (JavaScript)"
```

## 監視項目と閾値

### VS Code メモリ使用量
- **正常範囲**: 3-6 GB（プロセス数: 15-25個）
- **注意範囲**: 6-8 GB
- **警告範囲**: 8 GB以上

### Node.js プロセス
- **正常範囲**: 1-3 GB（開発サーバー実行時）
- **注意範囲**: 3-4 GB
- **警告範囲**: 4 GB以上

### システム全体
- **正常範囲**: 70%以下
- **注意範囲**: 70-80%
- **警告範囲**: 80-90%
- **危険範囲**: 90%以上

## アラート対応手順

### VS Codeメモリ過多の場合
1. 不要なタブやエディターを閉じる
2. 拡張機能を無効化または再起動
3. VS Codeを再起動
4. 必要に応じてワークスペースを分割

### Node.jsメモリ過多の場合
1. 開発サーバーを再起動
2. `yarn dev`を停止して再開
3. メモリリークの原因となるコードを確認
4. 必要に応じてNode.jsプロセスを手動終了

### システムメモリ不足の場合
1. 不要なアプリケーションを終了
2. ブラウザのタブを整理
3. 一時的にVS CodeやNode.jsプロセスを停止
4. システムの再起動を検討

## 自動化設定

### 定期的なヘルスチェック
以下のスケジュールでパフォーマンスチェックを実行することを推奨します：

1. **毎時**: クイックチェック（1分以内）
2. **毎日**: 詳細レポート生成
3. **毎週**: パフォーマンス傾向分析

### ログファイル管理
- **ログ保存先**: `performance-monitor.log`
- **ローテーション**: 毎週または5MB到達時
- **保持期間**: 4週間

## カスタマイズ

### 閾値の調整
`performance-monitor.ps1`のパラメーターを変更：
```powershell
# カスタム閾値で実行
.\performance-monitor.ps1 -VSCodeMemoryThresholdMB 6000 -NodeMemoryThresholdMB 3000 -IntervalSeconds 30
```

### 通知設定
現在は以下の通知方法が利用可能：
- コンソール出力
- ログファイル記録

将来的な拡張予定：
- メール通知
- Slack通知
- Windows通知

## トラブルシューティング

### よくある問題

#### PowerShellスクリプトが実行できない
```powershell
# 実行ポリシーを一時的に変更
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### タスクが見つからない
1. VS Codeのワークスペースが正しく開かれているか確認
2. `.vscode/tasks.json`が存在するか確認
3. VS Codeを再読み込み（Ctrl+Shift+P → "Developer: Reload Window"）

#### メモリ監視が正常に動作しない
1. プロセスが実際に実行されているか確認
2. PowerShellまたはNodeの権限を確認
3. ファイアウォールやセキュリティソフトの設定を確認

## パフォーマンス最適化の継続

### 定期的なメンテナンス
1. **月次**: VS Code拡張機能の見直し
2. **月次**: Node.jsバージョンの更新確認
3. **月次**: 不要なファイルやフォルダの清理
4. **四半期**: システム全体のパフォーマンス見直し

### 監視データの活用
1. パフォーマンスログを定期的に分析
2. メモリ使用量の傾向を把握
3. 問題のパターンを特定
4. 予防的な対策を実施

## 参考資料

- [VS Code Performance Tips](https://code.visualstudio.com/docs/getstarted/tips-and-tricks#_performance)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Memory Leak Detection in Node.js](https://blog.risingstack.com/finding-a-memory-leak-in-node-js/)

## 更新履歴

- **2025-06-06**: 初回作成、基本的な監視ワークフロー設定
- **今後**: 通知機能の拡張、自動化レベルの向上予定
