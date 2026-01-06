@echo off
chcp 65001 >nul
echo ========================================
echo 配置 SSH 密钥免密登录
echo ========================================
echo.

set SERVER_IP=39.97.243.8
set SERVER_USER=admin
set SSH_KEY_PATH=%USERPROFILE%\.ssh\id_rsa.pub

REM 检查 SSH 密钥是否存在
if not exist "%SSH_KEY_PATH%" (
    echo ❌ 未找到 SSH 公钥: %SSH_KEY_PATH%
    echo.
    echo 正在生成新的 SSH 密钥...
    ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
    if errorlevel 1 (
        echo ❌ 密钥生成失败
        pause
        exit /b 1
    )
    echo ✅ SSH 密钥生成成功
    echo.
)

echo 📋 你的公钥内容：
type "%SSH_KEY_PATH%"
echo.
echo 请输入服务器密码（用于配置免密登录）
echo.

REM 尝试复制公钥到服务器
echo 正在将公钥复制到服务器...
type "%SSH_KEY_PATH%" | ssh %SERVER_USER%@%SERVER_IP% "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

if errorlevel 1 (
    echo.
    echo ❌ SSH 密钥配置失败
    echo.
    echo 请手动执行以下步骤：
    echo 1. 复制公钥内容：
    echo    type "%SSH_KEY_PATH%"
    echo.
    echo 2. SSH 连接到服务器：
    echo    ssh %SERVER_USER%@%SERVER_IP%
    echo.
    echo 3. 在服务器上执行：
    echo    mkdir -p ~/.ssh
    echo    chmod 700 ~/.ssh
    echo    echo '你的公钥内容' ^>^> ~/.ssh/authorized_keys
    echo    chmod 600 ~/.ssh/authorized_keys
    pause
    exit /b 1
)

echo.
echo ✅ SSH 密钥配置成功！
echo.
echo 测试连接...
ssh -o BatchMode=yes -o ConnectTimeout=5 %SERVER_USER%@%SERVER_IP% "echo '连接成功！'"

if errorlevel 1 (
    echo ⚠️ 配置完成，但测试连接失败，请手动测试
) else (
    echo ✅ 免密登录配置成功！现在可以无需密码连接服务器了
)

echo.
pause

