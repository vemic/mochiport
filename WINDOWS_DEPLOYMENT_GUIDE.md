# MochiPort Windows Standalone Deployment Guide

## 概要

このガイドでは、MochiPortアプリケーションをWindows環境でスタンドアロンサーバとして運用するための完全な構成手順を説明します。

## 前提条件

### システム要件
- **OS**: Windows 10/11 または Windows Server 2019/2022
- **CPU**: 2コア以上（推奨: 4コア）
- **メモリ**: 4GB以上（推奨: 8GB）
- **ディスク**: 10GB以上の空き容量
- **ネットワーク**: インターネット接続（初期セットアップ時）

### 必要なソフトウェア
- **Node.js**: 22.16.0 LTS以上
- **Yarn**: 1.22.19以上
- **Git**: 最新版（オプション）
- **PowerShell**: 5.1以上

## クイックスタートインストール

### 1. 管理者権限での実行

```cmd
# 管理者としてコマンドプロンプトまたはPowerShellを起動
# プロジェクトディレクトリに移動
cd C:\path\to\mochiport

# 統合インストールスクリプトを実行
windows-deployment\install-mochiport.bat
```

このスクリプトが以下を自動実行します：
- 依存関係のチェック・インストール
- アプリケーションのビルド
- PM2によるプロセス管理設定
- Windowsファイアウォール設定
- 監視ツールのインストール

### 2. 管理ダッシュボードの起動

```cmd
windows-deployment\management-dashboard.bat
```

## 詳細設定手順

### セキュリティ設定

```powershell
# セキュリティ設定の完全構成
.\windows-deployment\security-config.ps1 -Configure

# セキュリティ監査の実行
.\windows-deployment\security-config.ps1 -AuditSecurity
```

**設定内容:**
- Windowsファイアウォール設定
- HTTPS/SSL証明書の生成
- セキュリティヘッダーの設定
- 認証システムの構成

### 監視・ヘルスチェック

```powershell
# 高度な監視システムの開始
.\windows-deployment\advanced-monitoring.ps1 -StartMonitoring

# 自動復旧システムの開始
.\windows-deployment\recovery-system.ps1 -StartRecoveryService
```

### バックアップシステム

```cmd
# 手動バックアップの作成
windows-deployment\backup-system.bat

# 自動バックアップの設定（日次2:00AM）
schtasks /create /tn "MochiPort Daily Backup" /tr "C:\path\to\mochiport\windows-deployment\backup-system.bat" /sc daily /st 02:00 /f
```

## Windowsサービス化

### PM2サービスの設定

```cmd
# PM2をWindowsサービスとして登録
npm install -g pm2-windows-service
pm2-service-install -n MochiPort

# サービスの開始
net start MochiPort
```

### 代替: node-windowsを使用したサービス化

```javascript
// service-install.js
var Service = require('node-windows').Service;

var svc = new Service({
  name: 'MochiPort',
  description: 'MochiPort AI Chat Application',
  script: 'C:\\path\\to\\mochiport\\backend\\dist\\server.js',
  workingDirectory: 'C:\\path\\to\\mochiport',
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});

svc.on('install', function(){
  svc.start();
});

svc.install();
```

## 運用管理

### 日常的なメンテナンス

#### サービス状態確認
```cmd
pm2 status
pm2 logs
pm2 monit
```

#### ヘルスチェック
```cmd
curl http://localhost:7071/api/health
curl http://localhost:3000
```

#### ログ確認
```cmd
# エラーログの確認
type logs\backend-error.log
type logs\frontend-error.log

# システムログの確認
pm2 logs --lines 100
```

### パフォーマンス監視

#### リソース使用状況
```powershell
# メモリ使用状況
Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Format-Table ProcessName, Id, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet64/1MB,2)}}

# CPU使用状況
Get-Counter "\Processor(_Total)\% Processor Time"

# ディスク使用状況
Get-WmiObject Win32_LogicalDisk | Select-Object DeviceID, @{Name='Size(GB)';Expression={[math]::Round($_.Size/1GB,2)}}, @{Name='Free(GB)';Expression={[math]::Round($_.FreeSpace/1GB,2)}}
```

#### パフォーマンステスト
```cmd
# 負荷テスト
npx autocannon http://localhost:7071/api/health -d 30 -c 10

# パフォーマンスプロファイル
clinic doctor --on-port 'autocannon http://localhost:7071/api/health -d 10' -- node backend/dist/server.js
```

### トラブルシューティング

#### 一般的な問題と解決策

**1. ポート競合**
```cmd
# ポート使用状況確認
netstat -an | findstr ":3000\|:7071"

# プロセス終了
taskkill /F /PID <PID>
```

**2. 依存関係の問題**
```cmd
# 依存関係の再インストール
yarn clean
yarn install --frozen-lockfile
yarn build
```

**3. メモリ不足**
```cmd
# プロセス再起動
pm2 restart ecosystem.config.json

# メモリ使用量確認
pm2 monit
```

**4. 証明書の問題**
```powershell
# 新しい証明書の生成
.\windows-deployment\security-config.ps1 -SetupHTTPS
```

#### ログファイルの場所
- **アプリケーションログ**: `logs/`
- **PM2ログ**: `%USERPROFILE%\.pm2\logs\`
- **Windowsイベントログ**: イベントビューアー > アプリケーション

## アップデート手順

### 1. アプリケーションの停止
```cmd
pm2 stop ecosystem.config.json
```

### 2. バックアップの作成
```cmd
windows-deployment\backup-system.bat
```

### 3. ソースコードの更新
```cmd
git pull  # Gitを使用している場合
# または手動でファイルを更新
```

### 4. 依存関係の更新とビルド
```cmd
yarn install
yarn build
```

### 5. アプリケーションの再起動
```cmd
pm2 start ecosystem.config.json --env production
```

### 6. 動作確認
```cmd
curl http://localhost:7071/api/health
curl http://localhost:3000
```

## セキュリティベストプラクティス

### 1. 定期的なセキュリティ監査
```powershell
# 月次実行推奨
.\windows-deployment\security-config.ps1 -AuditSecurity
```

### 2. SSL証明書の更新
- 自己署名証明書: 年次更新
- 商用証明書: 有効期限前に更新
- Let's Encrypt: 自動更新設定

### 3. アクセス制御
- 管理者アカウントの限定
- 不要なポートの閉鎖
- IPホワイトリストの設定

### 4. データ保護
- データベースの暗号化
- バックアップの暗号化
- ログファイルのローテーション

## パフォーマンス最適化

### 1. Node.jsの最適化
```javascript
// ecosystem.config.jsonの最適化例
{
  "max_memory_restart": "1G",
  "node_args": ["--max-old-space-size=1024"],
  "instances": "max"  // CPUコア数に応じて
}
```

### 2. システムレベルの最適化
- ページファイルサイズの調整
- 不要なサービスの停止
- システムファイルの最適化

### 3. ネットワーク最適化
- Keep-Aliveの有効化
- Gzip圧縮の有効化
- キャッシュヘッダーの設定

## 災害復旧計画

### 1. バックアップ戦略
- **日次**: アプリケーションデータ
- **週次**: システム設定
- **月次**: 完全システムイメージ

### 2. 復旧手順
1. システムの初期化
2. バックアップからの復元
3. サービスの再構成
4. 動作確認

### 3. 事業継続計画
- 冗長化構成の検討
- 代替サーバーの準備
- データ同期の自動化

## サポート・ドキュメント

### ログファイル
- `logs/security.log`: セキュリティ関連
- `logs/monitoring.log`: 監視関連
- `logs/recovery.log`: 復旧関連
- `logs/backup.log`: バックアップ関連

### 設定ファイル
- `ecosystem.config.json`: PM2設定
- `backend/.env.production`: バックエンド環境変数
- `frontend/.env.production`: フロントエンド環境変数
- `config/auth-config.json`: 認証設定

### サポート情報の収集
```cmd
# サポート情報の生成
windows-deployment\management-dashboard.bat
# -> 7. Troubleshooting -> 7. Generate Support Report
```

---

**注意**: 本番環境での運用前に、必ずテスト環境で全ての手順を検証してください。
