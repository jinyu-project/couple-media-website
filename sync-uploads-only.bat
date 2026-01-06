@echo off
chcp 65001 >nul
echo ========================================
echo 仅同步用户上传的内容
echo ========================================
echo.

REM 服务器配置
set SERVER_IP=39.97.243.8
set SERVER_USER=admin
set SERVER_PATH=/home/admin/couple-media-website/server

echo [1/3] 下载照片文件（可能需要几分钟）...
echo   从服务器: %SERVER_PATH%/uploads/photos/
echo   到本地: server/uploads/photos/
scp -r %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/uploads/photos server/uploads/
if %ERRORLEVEL% EQU 0 (
    echo ✅ 照片文件下载完成
) else (
    echo ⚠️ 照片文件下载可能失败
)
echo.

echo [2/3] 下载视频文件（可能需要几分钟）...
echo   从服务器: %SERVER_PATH%/uploads/videos/
echo   到本地: server/uploads/videos/
scp -r %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/uploads/videos server/uploads/
if %ERRORLEVEL% EQU 0 (
    echo ✅ 视频文件下载完成
) else (
    echo ⚠️ 视频文件下载可能失败
)
echo.

echo [3/3] 下载小说封面...
echo   从服务器: %SERVER_PATH%/uploads/novel-covers/
echo   到本地: server/uploads/novel-covers/
scp -r %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/uploads/novel-covers server/uploads/ 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ 小说封面下载完成
) else (
    echo ℹ️ 小说封面目录不存在或为空，跳过
)
echo.

echo ========================================
echo ✅ 上传内容同步完成！
echo ========================================
echo.
echo 已同步的内容：
echo   ✅ server/uploads/photos/（照片）
echo   ✅ server/uploads/videos/（视频）
echo   ✅ server/uploads/novel-covers/（小说封面）
echo.
echo ⚠️ 注意：数据文件（JSON）未同步
echo    如需同步数据文件，请运行: sync-from-server.bat
echo.
pause

