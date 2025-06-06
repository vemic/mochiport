#!/usr/bin/env node
// メモリ使用量監視スクリプト
const { exec } = require("child_process");
const os = require("os");

console.log("🔍 Node.js プロセスのメモリ使用量を監視します...\n");

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function showSystemInfo() {
  console.log("📊 システム情報:");
  console.log(`   Total Memory: ${formatBytes(os.totalmem())}`);
  console.log(`   Free Memory:  ${formatBytes(os.freemem())}`);
  console.log(`   Used Memory:  ${formatBytes(os.totalmem() - os.freemem())}`);
  console.log(`   CPU Cores:    ${os.cpus().length}`);
  console.log("");
}

function checkNodeProcesses() {
  // Windows用のtasklistコマンド
  exec('tasklist /fi "imagename eq node.exe" /fo csv', (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Node.jsプロセス確認エラー:", error.message);
      return;
    }

    const lines = stdout.split('\n').slice(1); // ヘッダーをスキップ
    const nodeProcesses = lines.filter(line => line.trim() && line.includes('node.exe'));
    
    if (nodeProcesses.length > 0) {
      console.log("🔍 Node.js プロセス:");
      nodeProcesses.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 5) {
          const pid = parts[1].replace(/"/g, '');
          const memory = parts[4].replace(/"/g, '').replace(/[^\d]/g, '');
          if (memory) {
            console.log(`  PID ${pid}: ${Math.round(parseInt(memory) / 1024)}MB`);
          }
        }
      });
    } else {
      console.log("✅ Node.jsプロセスが見つかりません（正常）");
    }
    console.log("");
  });

  // VS Codeプロセスもチェック
  exec('tasklist /fi "imagename eq Code.exe" /fo csv', (error, stdout, stderr) => {
    if (error) {
      console.error("❌ VS Codeプロセス確認エラー:", error.message);
      return;
    }
    
    const lines = stdout.split('\n').slice(1);
    const codeProcesses = lines.filter(line => line.trim() && line.includes('Code.exe'));
    
    if (codeProcesses.length > 0) {
      console.log("🔍 VS Code プロセス:");
      let totalMemory = 0;
      codeProcesses.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 5) {
          const pid = parts[1].replace(/"/g, '');
          const memory = parts[4].replace(/"/g, '').replace(/[^\d]/g, '');
          if (memory) {
            const memoryMB = Math.round(parseInt(memory) / 1024);
            totalMemory += memoryMB;
            console.log(`  PID ${pid}: ${memoryMB}MB`);
          }
        }
      });
      console.log(`  📊 合計VS Codeメモリ: ${totalMemory}MB`);
      
      if (totalMemory > 2000) {
        console.log(`  ⚠️  警告: VS Codeが${totalMemory}MB使用中（>2GB）最適化を検討してください`);
      } else if (totalMemory > 1000) {
        console.log(`  ⚡ 情報: VS Codeが${totalMemory}MB使用中（中程度）`);
      } else {
        console.log(`  ✅ VS Codeメモリ使用量正常: ${totalMemory}MB`);
      }
    } else {
      console.log("❌ VS Codeプロセスが見つかりません");
    }
    console.log("");
  });
}

function showMemoryUsage() {
  const used = process.memoryUsage();
  console.log("📈 現在のプロセスのメモリ使用量:");
  console.log(`   RSS (Resident Set Size): ${formatBytes(used.rss)}`);
  console.log(`   Heap Used:               ${formatBytes(used.heapUsed)}`);
  console.log(`   Heap Total:              ${formatBytes(used.heapTotal)}`);
  console.log(`   External:                ${formatBytes(used.external)}`);
  console.log(`   Array Buffers:           ${formatBytes(used.arrayBuffers)}`);
  console.log("");
}

function runOnce() {
  console.log("🔍 メモリ使用状況確認 - " + new Date().toLocaleString());
  console.log("".padEnd(60, "="));
  showSystemInfo();
  showMemoryUsage();
  checkNodeProcesses();
}

function startMonitoring() {
  runOnce();
  console.log("🔄 10秒ごとに更新中... (Ctrl+Cで終了)");

  const intervalId = setInterval(() => {
    console.clear();
    runOnce();
  }, 10000);

  // プロセス終了時のクリーンアップ
  process.on("SIGINT", () => {
    clearInterval(intervalId);
    console.log("\n👋 監視を終了します");
    process.exit(0);
  });
}

// スクリプト実行
if (require.main === module) {
  // 引数によって実行モードを変更
  const args = process.argv.slice(2);
  if (args.includes('--once') || args.includes('-o')) {
    runOnce();
  } else {
    startMonitoring();
  }
}

module.exports = { formatBytes, showSystemInfo, showMemoryUsage, runOnce };
