@echo off
chcp 65001 >nul
echo ========================================
echo 从服务器同步数据到本地
echo ========================================
echo.

REM 服务器配置
set SERVER_IP=39.97.243.8
set SERVER_USER=admin
set SERVER_PATH=/home/admin/couple-media-website/server

REM 创建备份
set BACKUP_DIR=backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
if exist server\data (
    echo 创建本地数据备份...
    mkdir %BACKUP_DIR% 2>nul
    xcopy server\data %BACKUP_DIR%\data\ /E /I /Y >nul 2>&1
    echo 备份完成
    echo.
)

echo [1/4] 下载数据文件（JSON）...
scp %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/data/*.json server/data/
if %ERRORLEVEL% EQU 0 (
    echo 数据文件下载完成
) else (
    echo 数据文件下载可能失败
)
echo.

echo [2/4] 下载照片文件（可能需要几分钟）...
scp -r %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/uploads/photos server/uploads/
if %ERRORLEVEL% EQU 0 (
    echo 照片文件下载完成
) else (
    echo 照片文件下载可能失败
)
echo.

echo [3/4] 下载视频文件（可能需要几分钟）...
scp -r %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/uploads/videos server/uploads/
if %ERRORLEVEL% EQU 0 (
    echo 视频文件下载完成
) else (
    echo 视频文件下载可能失败
)
echo.

echo [4/4] 下载小说封面...
scp -r %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/uploads/novel-covers server/uploads/ 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 小说封面下载完成
) else (
    echo 小说封面目录不存在或为空，跳过
)
echo.

echo ========================================
echo 同步完成！
echo ========================================
echo.
echo 数据已同步到本地：
echo   - server/data/*.json
echo   - server/uploads/photos/
echo   - server/uploads/videos/
echo   - server/uploads/novel-covers/
echo.
if exist %BACKUP_DIR% (
    echo 备份保存在: %BACKUP_DIR%
)
echo.
pause

