# 配置 SSH 密钥免密登录到服务器

$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa.pub"

Write-Host "========================================" -ForegroundColor Green
Write-Host "配置 SSH 密钥免密登录" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查本地 SSH 密钥是否存在
if (-not (Test-Path $SSH_KEY_PATH)) {
    Write-Host "❌ 未找到 SSH 公钥: $SSH_KEY_PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "正在生成新的 SSH 密钥..." -ForegroundColor Yellow
    
    # 生成 SSH 密钥
    ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""'
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 密钥生成失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ SSH 密钥生成成功" -ForegroundColor Green
    Write-Host ""
}

# 读取公钥内容
$publicKey = Get-Content $SSH_KEY_PATH -Raw
Write-Host "📋 你的公钥内容：" -ForegroundColor Cyan
Write-Host $publicKey.Trim() -ForegroundColor Gray
Write-Host ""

# 提示用户输入服务器密码
Write-Host "请输入服务器密码（用于配置免密登录）:" -ForegroundColor Yellow
Write-Host "密码: " -NoNewline -ForegroundColor Yellow

# 将公钥复制到服务器
Write-Host ""
Write-Host "正在将公钥复制到服务器..." -ForegroundColor Yellow

# 使用 ssh-copy-id（如果可用）或手动复制
$copyCommand = "type $SSH_KEY_PATH | ssh ${SERVER_USER}@${SERVER_IP} `"mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys`""

# 尝试使用 ssh-copy-id（Windows 10 1809+ 或安装了 OpenSSH）
$sshCopyId = Get-Command ssh-copy-id -ErrorAction SilentlyContinue
if ($sshCopyId) {
    ssh-copy-id -i $SSH_KEY_PATH ${SERVER_USER}@${SERVER_IP}
} else {
    # 手动复制公钥
    Write-Host "使用手动方式复制公钥..." -ForegroundColor Yellow
    $publicKeyContent = Get-Content $SSH_KEY_PATH -Raw
    $publicKeyContent | ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SSH 密钥配置成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "测试连接..." -ForegroundColor Yellow
    
    # 测试连接
    ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo '连接成功！'" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 免密登录配置成功！现在可以无需密码连接服务器了" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 配置完成，但测试连接失败，请手动测试" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ SSH 密钥配置失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动执行以下步骤：" -ForegroundColor Yellow
    Write-Host "1. 复制公钥内容：" -ForegroundColor Cyan
    Write-Host "   Get-Content $SSH_KEY_PATH" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. SSH 连接到服务器：" -ForegroundColor Cyan
    Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. 在服务器上执行：" -ForegroundColor Cyan
    Write-Host "   mkdir -p ~/.ssh" -ForegroundColor Gray
    Write-Host "   chmod 700 ~/.ssh" -ForegroundColor Gray
    Write-Host "   echo '你的公钥内容' >> ~/.ssh/authorized_keys" -ForegroundColor Gray
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Gray
}

Write-Host ""

