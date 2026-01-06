# 从服务器同步数据到本地脚本

$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SERVER_PATH = "/home/admin/couple-media-website/server"

Write-Host "========================================" -ForegroundColor Green
Write-Host "从服务器同步数据到本地" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查服务器连接
Write-Host "检查服务器连接..." -ForegroundColor Yellow
$testConnection = ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 无法连接到服务器，请检查网络和密码" -ForegroundColor Red
    exit 1
}

# 创建备份（可选）
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (Test-Path server/data) {
    Write-Host "创建本地数据备份到: $backupDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Copy-Item -Path server/data -Destination "$backupDir/data" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ 备份完成" -ForegroundColor Green
    Write-Host ""
}

# 1. 下载数据文件
Write-Host "[1/4] 下载数据文件（JSON）..." -ForegroundColor Cyan
scp ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/data/*.json server/data/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 数据文件下载完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 数据文件下载可能失败，请检查" -ForegroundColor Yellow
}
Write-Host ""

# 2. 下载照片文件
Write-Host "[2/4] 下载照片文件（可能需要几分钟）..." -ForegroundColor Cyan
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/photos server/uploads/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 照片文件下载完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 照片文件下载可能失败，请检查" -ForegroundColor Yellow
}
Write-Host ""

# 3. 下载视频文件
Write-Host "[3/4] 下载视频文件（可能需要几分钟）..." -ForegroundColor Cyan
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/videos server/uploads/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 视频文件下载完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 视频文件下载可能失败，请检查" -ForegroundColor Yellow
}
Write-Host ""

# 4. 下载小说封面（如果存在）
Write-Host "[4/4] 下载小说封面..." -ForegroundColor Cyan
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/novel-covers server/uploads/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 小说封面下载完成" -ForegroundColor Green
} else {
    Write-Host "ℹ️ 小说封面目录不存在或为空，跳过" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 同步完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "数据已同步到本地：" -ForegroundColor Yellow
Write-Host "  - server/data/*.json" -ForegroundColor Cyan
Write-Host "  - server/uploads/photos/" -ForegroundColor Cyan
Write-Host "  - server/uploads/videos/" -ForegroundColor Cyan
Write-Host "  - server/uploads/novel-covers/" -ForegroundColor Cyan
Write-Host ""
if (Test-Path $backupDir) {
    Write-Host "备份保存在: $backupDir" -ForegroundColor Gray
}

