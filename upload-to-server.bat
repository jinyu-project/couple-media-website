@echo off
chcp 65001 >nul
echo 🚀 开始上传代码到服务器...

REM 服务器配置（请根据实际情况修改）
set SERVER_IP=39.97.243.8
set SERVER_USER=admin
set SERVER_PATH=/home/admin/couple-media-website

echo 服务器: %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%
echo.

echo 📦 正在上传文件...
echo.

REM 上传根目录文件
echo [1/5] 上传根目录配置文件...
scp package.json package-lock.json ecosystem.config.js deploy.sh nginx.conf.example %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/

REM 上传 server/src 目录
echo [2/5] 上传 server/src 目录...
scp -r server/src %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/server/

REM 上传 server 配置文件
echo [3/5] 上传 server 配置文件...
scp server/package.json server/package-lock.json %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/server/

REM 上传 client/src 目录
echo [4/5] 上传 client/src 目录...
scp -r client/src client/public %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/client/ 2>nul

REM 上传 client 配置文件
echo [5/5] 上传 client 配置文件...
scp client/package.json client/package-lock.json client/vite.config.js client/tailwind.config.js client/postcss.config.js client/index.html %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/client/

echo.
echo ✅ 文件上传完成！
echo.
echo 下一步请在服务器上执行：
echo   ssh %SERVER_USER%@%SERVER_IP%
echo   cd %SERVER_PATH%
echo   ./deploy.sh
echo.
pause

