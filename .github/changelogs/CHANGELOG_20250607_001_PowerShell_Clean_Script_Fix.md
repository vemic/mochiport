# PowerShellクリーンスクリプト修正

## 問題概要

各パッケージ（frontend, shared, backend）のpackage.jsonに定義されているcleanスクリプトでPowerShellコマンド実行時にエラーが発生していました。特にフロントエンドパッケージでは `.next` や `out` ディレクトリを削除する際に問題が発生していました。

## 修正内容

各パッケージのcleanスクリプトを以下のように修正しました：

### frontend/package.json

```diff
- "clean": "powershell -Command \"Remove-Item -Path '.next', 'out' -Recurse -Force -ErrorAction SilentlyContinue\"",
+ "clean": "powershell -Command \"if(Test-Path '.next'){Remove-Item -Path '.next' -Recurse -Force}; if(Test-Path 'out'){Remove-Item -Path 'out' -Recurse -Force}\"",
```

### shared/package.json および backend/package.json

```diff
- "clean": "powershell -Command \"Remove-Item -Path 'dist' -Recurse -Force -ErrorAction SilentlyContinue\"",
+ "clean": "powershell -Command \"if(Test-Path 'dist'){Remove-Item -Path 'dist' -Recurse -Force}\"",
```

## 技術的詳細

1. **問題の原因**: 
   - PowerShellコマンドで複数パスを指定する際の構文エラー
   - 存在しないディレクトリを削除しようとした際のエラーハンドリングの問題

2. **解決策**:
   - 各ディレクトリごとに `Test-Path` チェックを追加してから削除を実行
   - PowerShellコマンド構文を正しく修正（セミコロンでの区切り）

## 影響範囲

- **改善点**: 
  - ビルドパイプラインの安定性向上
  - クリーンコマンドのエラー発生低減
  - TurboRepoキャッシュ管理の信頼性向上

- **互換性**: 既存のビルドスクリプトやCI/CDパイプラインと完全互換

## 検証結果

各パッケージでcleanコマンドを個別に実行し、その後プロジェクトルートで `yarn clean` を実行して全パッケージで正常に動作することを確認しました。エラー発生は解消されました。

## 今後の対応

1. 他のPowerShellスクリプトにも同様の問題がないか確認
2. CI/CDパイプラインでの安定性を確保するための追加テストを検討
