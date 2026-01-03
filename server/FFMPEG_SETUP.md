# FFmpeg 安装说明

本项目使用 FFmpeg 来提取视频的第一帧作为封面图片。

## Windows 安装 FFmpeg

### 方法 1：使用 Chocolatey（推荐）

1. 安装 Chocolatey（如果还没有）：
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. 使用 Chocolatey 安装 FFmpeg：
   ```powershell
   choco install ffmpeg
   ```

### 方法 2：手动安装

1. 访问 https://ffmpeg.org/download.html
2. 下载 Windows 版本的 FFmpeg
3. 解压到一个目录（例如：`C:\ffmpeg`）
4. 将 `C:\ffmpeg\bin` 添加到系统 PATH 环境变量中
5. 重启命令行或 PowerShell

## 验证安装

在命令行中运行：
```bash
ffmpeg -version
```

如果显示版本信息，说明安装成功。

## 功能说明

- 上传视频文件时，系统会自动提取视频的第一帧（0秒位置）作为封面
- 缩略图尺寸：800x450（16:9比例）
- 格式：JPG
- 如果 FFmpeg 不可用或提取失败，系统会使用默认的 SVG 封面

## 注意事项

- FFmpeg 必须正确安装并添加到系统 PATH 中
- 提取缩略图可能需要一些时间，特别是对于大文件
- 如果提取失败，系统会自动回退到默认封面


