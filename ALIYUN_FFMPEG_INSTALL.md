# 阿里云服务器 FFmpeg 安装指南

## 问题说明

阿里云 CentOS 8 系统可能已经安装了 `epel-aliyuncs-release`，与标准的 `epel-release` 冲突。

## 解决方案

### 方法一：使用 --allowerasing（推荐）

```bash
sudo dnf install -y epel-release --allowerasing
sudo dnf install -y ffmpeg
```

### 方法二：直接使用阿里云 EPEL 源安装

```bash
# 尝试直接安装（如果源中已有）
sudo dnf install -y ffmpeg

# 如果还是找不到，启用 PowerTools 仓库
sudo dnf config-manager --set-enabled powertools
sudo dnf install -y ffmpeg
```

### 方法三：从 RPM Fusion 安装（最可靠）

```bash
# 安装 RPM Fusion 仓库
sudo dnf install -y --nogpgcheck https://download1.rpmfusion.org/free/el/rpmfusion-free-release-8.noarch.rpm
sudo dnf install -y --nogpgcheck https://download1.rpmfusion.org/nonfree/el/rpmfusion-nonfree-release-8.noarch.rpm

# 安装 FFmpeg
sudo dnf install -y ffmpeg ffmpeg-devel
```

### 方法四：编译安装（如果以上都失败）

```bash
# 安装编译依赖
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y yasm nasm

# 下载 FFmpeg 源码
cd /tmp
wget https://ffmpeg.org/releases/ffmpeg-6.0.tar.xz
tar -xf ffmpeg-6.0.tar.xz
cd ffmpeg-6.0

# 编译安装
./configure --prefix=/usr/local --enable-shared
make -j$(nproc)
sudo make install

# 添加到 PATH
echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 验证安装

```bash
ffmpeg -version
```

## 注意事项

- FFmpeg 是可选的，如果没有安装，视频上传时会使用默认封面
- 如果安装失败，可以继续部署，不影响其他功能


