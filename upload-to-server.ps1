# 上传代码到服务器脚本
# 使用方法: .\upload-to-server.ps1

# 服务器配置（请根据实际情况修改）
$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SERVER_PATH = "/home/admin/couple-media-website"
$LOCAL_PATH = "."

Write-Host "🚀 开始上传代码到服务器..." -ForegroundColor Green
Write-Host "服务器: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}" -ForegroundColor Yellow

# 检查是否安装了 OpenSSH
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到 scp 命令，请安装 OpenSSH" -ForegroundColor Red
    Write-Host "Windows 10/11 用户可以在 '设置 > 应用 > 可选功能' 中安装 OpenSSH 客户端" -ForegroundColor Yellow
    exit 1
}

# 创建临时排除文件列表
$excludeFile = "rsync-exclude.txt"
@"
node_modules/
dist/
.git/
*.log
.env
uploads/
data/
.DS_Store
Thumbs.db
"@ | Out-File -FilePath $excludeFile -Encoding UTF8

Write-Host "📦 正在上传文件..." -ForegroundColor Yellow

# 使用 scp 上传（需要手动排除 node_modules 等目录）
# 由于 scp 不支持排除文件，我们需要分别上传各个目录

# 上传根目录文件
Write-Host "上传根目录文件..." -ForegroundColor Cyan
scp -r package.json package-lock.json ecosystem.config.js deploy.sh nginx.conf.example "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

# 上传 server 目录（排除 node_modules）
Write-Host "上传 server 目录..." -ForegroundColor Cyan
scp -r server/src "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/server/"
scp server/package.json server/package-lock.json "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/server/"

# 上传 client 目录（排除 node_modules 和 dist）
Write-Host "上传 client 目录..." -ForegroundColor Cyan
scp -r client/src client/public "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/client/"
scp client/package.json client/package-lock.json client/vite.config.js client/tailwind.config.js client/postcss.config.js client/index.html "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/client/"

# 清理临时文件
Remove-Item $excludeFile -ErrorAction SilentlyContinue

Write-Host "✅ 文件上传完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步请在服务器上执行：" -ForegroundColor Yellow
Write-Host "  cd ${SERVER_PATH}" -ForegroundColor Cyan
Write-Host "  ./deploy.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "或者手动执行：" -ForegroundColor Yellow
Write-Host "  cd ${SERVER_PATH}/server && npm install --production" -ForegroundColor Cyan
Write-Host "  cd ${SERVER_PATH}/client && npm install && npm run build" -ForegroundColor Cyan
Write-Host "  pm2 restart ecosystem.config.js" -ForegroundColor Cyan

