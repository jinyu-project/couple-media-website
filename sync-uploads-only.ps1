# 仅同步用户上传的内容（照片、视频、小说封面）
# 不覆盖本地数据文件（JSON）

$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SERVER_PATH = "/home/admin/couple-media-website/server"

Write-Host "========================================" -ForegroundColor Green
Write-Host "仅同步用户上传的内容" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查服务器连接
Write-Host "检查服务器连接..." -ForegroundColor Yellow
$testConnection = ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 无法连接到服务器，请检查网络和密码" -ForegroundColor Red
    exit 1
}

# 1. 下载照片文件
Write-Host "[1/3] 下载照片文件（可能需要几分钟）..." -ForegroundColor Cyan
Write-Host "  从服务器: ${SERVER_PATH}/uploads/photos/" -ForegroundColor Gray
Write-Host "  到本地: server/uploads/photos/" -ForegroundColor Gray
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/photos server/uploads/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 照片文件下载完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 照片文件下载可能失败，请检查" -ForegroundColor Yellow
}
Write-Host ""

# 2. 下载视频文件
Write-Host "[2/3] 下载视频文件（可能需要几分钟）..." -ForegroundColor Cyan
Write-Host "  从服务器: ${SERVER_PATH}/uploads/videos/" -ForegroundColor Gray
Write-Host "  到本地: server/uploads/videos/" -ForegroundColor Gray
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/videos server/uploads/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 视频文件下载完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 视频文件下载可能失败，请检查" -ForegroundColor Yellow
}
Write-Host ""

# 3. 下载小说封面（如果存在）
Write-Host "[3/3] 下载小说封面..." -ForegroundColor Cyan
Write-Host "  从服务器: ${SERVER_PATH}/uploads/novel-covers/" -ForegroundColor Gray
Write-Host "  到本地: server/uploads/novel-covers/" -ForegroundColor Gray
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/novel-covers server/uploads/ 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 小说封面下载完成" -ForegroundColor Green
} else {
    Write-Host "ℹ️ 小说封面目录不存在或为空，跳过" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 上传内容同步完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "已同步的内容：" -ForegroundColor Yellow
Write-Host "  ✅ server/uploads/photos/（照片）" -ForegroundColor Cyan
Write-Host "  ✅ server/uploads/videos/（视频）" -ForegroundColor Cyan
Write-Host "  ✅ server/uploads/novel-covers/（小说封面）" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ 注意：数据文件（JSON）未同步" -ForegroundColor Yellow
Write-Host "   如需同步数据文件，请运行: .\sync-from-server.ps1" -ForegroundColor Gray
Write-Host ""

