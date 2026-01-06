# PowerShell 命令别名配置
# 使用方法：在 PowerShell 中执行: . .\powershell-aliases.ps1
# 或者添加到 PowerShell 配置文件中：notepad $PROFILE

# 服务器配置
$env:SERVER_IP = "39.97.243.8"
$env:SERVER_USER = "admin"
$env:SERVER_PATH = "/home/admin/couple-media-website/server"

# 配置 SSH 密钥免密登录
function Setup-SSHKey {
    Write-Host "配置 SSH 密钥免密登录..." -ForegroundColor Green
    
    # 检查密钥是否存在
    if (-not (Test-Path "$env:USERPROFILE\.ssh\id_rsa.pub")) {
        Write-Host "生成 SSH 密钥..." -ForegroundColor Yellow
        ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""'
    }
    
    # 复制公钥到服务器
    Write-Host "复制公钥到服务器..." -ForegroundColor Yellow
    type "$env:USERPROFILE\.ssh\id_rsa.pub" | ssh ${env:SERVER_USER}@${env:SERVER_IP} "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
    
    Write-Host "✅ 配置完成！" -ForegroundColor Green
}

# 仅同步上传的内容
function Sync-Uploads {
    Write-Host "同步用户上传的内容..." -ForegroundColor Green
    
    scp -r ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/photos server/uploads/
    scp -r ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/videos server/uploads/
    scp -r ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/novel-covers server/uploads/ 2>$null
    
    Write-Host "✅ 同步完成！" -ForegroundColor Green
}

# 同步所有数据
function Sync-All {
    Write-Host "同步所有数据..." -ForegroundColor Green
    
    scp ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/data/*.json server/data/
    scp -r ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/photos server/uploads/
    scp -r ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/videos server/uploads/
    scp -r ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/novel-covers server/uploads/ 2>$null
    
    Write-Host "✅ 同步完成！" -ForegroundColor Green
}

# 上传数据到服务器
function Upload-Data {
    Write-Host "上传数据到服务器..." -ForegroundColor Green
    
    scp server/data/*.json ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/data/
    scp -r server/uploads/photos ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/
    scp -r server/uploads/videos ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/
    scp -r server/uploads/novel-covers ${env:SERVER_USER}@${env:SERVER_IP}:${env:SERVER_PATH}/uploads/ 2>$null
    
    Write-Host "✅ 上传完成！" -ForegroundColor Green
}

# SSH 连接到服务器
function Connect-Server {
    ssh ${env:SERVER_USER}@${env:SERVER_IP}
}

# 显示帮助信息
function Show-DeployHelp {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "部署命令帮助" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "配置 SSH 密钥:  Setup-SSHKey" -ForegroundColor Cyan
    Write-Host "同步上传内容:  Sync-Uploads" -ForegroundColor Cyan
    Write-Host "同步所有数据:  Sync-All" -ForegroundColor Cyan
    Write-Host "上传数据:      Upload-Data" -ForegroundColor Cyan
    Write-Host "连接服务器:    Connect-Server" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
}

# 显示帮助
Write-Host "✅ 命令别名已加载！" -ForegroundColor Green
Write-Host "输入 Show-DeployHelp 查看所有命令" -ForegroundColor Yellow

