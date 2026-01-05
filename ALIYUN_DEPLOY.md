# 阿里云服务器部署指南

本文档专门针对阿里云 ECS 服务器（CentOS/RHEL 系统）的部署步骤。

## 📋 前置检查

### 1. 检查系统信息
```bash
# 查看系统版本
cat /etc/os-release

# 查看 Node.js 版本（如果已安装）
node -v

# 查看 Git 版本
git --version
```

## 🚀 完整部署步骤

### 步骤 1: 安装 Node.js（如果未安装）

```bash
# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# 验证安装
node -v
npm -v
```

### 步骤 2: 安装 Git（如果未安装）

```bash
sudo dnf install -y git
git --version
```

### 步骤 3: 配置 Git SSH 密钥（如果未配置）

```bash
# 检查是否已有 SSH 密钥
ls -la ~/.ssh

# 如果没有，生成新的 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 查看公钥（复制后添加到 GitHub）
cat ~/.ssh/id_rsa.pub
```

将公钥添加到 GitHub：
1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥内容

### 步骤 4: 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2

# 验证安装
pm2 --version
```

### 步骤 5: 安装 FFmpeg（视频处理，可选但推荐）

```bash
# CentOS/RHEL 8+ 使用 dnf
sudo dnf install -y epel-release
sudo dnf install -y ffmpeg

# 验证安装
ffmpeg -version
```

### 步骤 6: 克隆项目

```bash
# 进入用户目录（或您想放置项目的目录）
cd ~

# 克隆项目
git clone git@github.com:jinyu-project/couple-media-website.git

# 进入项目目录
cd couple-media-website
```

### 步骤 7: 运行部署脚本

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

如果脚本执行失败，可以手动执行以下步骤：

```bash
# 安装后端依赖
cd server
npm install --production
cd ..

# 安装前端依赖
cd client
npm install
cd ..

# 构建前端
cd client
npm run build
cd ..

# 创建必要的目录
mkdir -p server/logs
mkdir -p server/uploads/photos
mkdir -p server/uploads/videos
mkdir -p server/uploads/docs
```

### 步骤 8: 配置环境变量

```bash
# 复制环境变量示例文件
cd server
cp env.example .env

# 编辑环境变量文件
nano .env
```

编辑 `.env` 文件，至少修改以下内容：

```env
PORT=3001
NODE_ENV=production

# JWT 密钥（必须修改为强密码）
JWT_SECRET=your-very-strong-secret-key-change-this-to-random-string
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

保存文件：
- `nano`: 按 `Ctrl+X`，然后 `Y`，然后 `Enter`
- `vim`: 按 `Esc`，输入 `:wq`，然后 `Enter`

### 步骤 9: 启动服务

```bash
# 返回项目根目录
cd ~/couple-media-website

# 使用 PM2 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 配置（开机自启）
pm2 save

# 设置 PM2 开机自启
pm2 startup
# 按照提示执行输出的命令（通常是 sudo 命令）
```

### 步骤 10: 验证服务运行

```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs couple-media-server

# 测试 API（在另一个终端或使用 curl）
curl http://localhost:3001/api/health
```

应该看到类似输出：
```json
{"status":"success","message":"服务运行正常","timestamp":"..."}
```

## 🔥 配置防火墙（重要）

### 阿里云安全组配置

1. **登录阿里云控制台**
   - 进入 ECS 实例管理
   - 点击您的服务器实例
   - 点击"安全组" -> "配置规则"

2. **添加入站规则**
   - 端口范围: `80` (HTTP)
   - 端口范围: `443` (HTTPS，如果使用 SSL)
   - 端口范围: `3001` (后端 API，如果直接访问)
   - 授权对象: `0.0.0.0/0` (或您的 IP)

### 服务器防火墙配置（firewalld）

```bash
# 检查防火墙状态
sudo systemctl status firewalld

# 如果防火墙未运行，启动它
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp

# 重载防火墙配置
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-all
```

## 🌐 配置 Nginx（反向代理，推荐）

### 安装 Nginx

```bash
sudo dnf install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 配置 Nginx

```bash
# 复制配置示例
sudo cp ~/couple-media-website/nginx.conf.example /etc/nginx/conf.d/couple-media.conf

# 编辑配置文件
sudo nano /etc/nginx/conf.d/couple-media.conf
```

修改以下内容：
- `server_name`: 您的域名或服务器 IP
- `root`: `/home/admin/couple-media-website/client/dist`（根据实际路径修改）

### 测试并重载 Nginx

```bash
# 测试配置
sudo nginx -t

# 如果测试通过，重载配置
sudo systemctl reload nginx
```

## 🔒 配置 SSL 证书（HTTPS，推荐）

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo dnf install -y certbot python3-certbot-nginx

# 获取证书（替换为您的域名）
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 📊 常用管理命令

### PM2 命令

```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs couple-media-server

# 重启服务
pm2 restart couple-media-server

# 停止服务
pm2 stop couple-media-server

# 删除服务
pm2 delete couple-media-server

# 监控面板
pm2 monit
```

### 更新代码

```bash
cd ~/couple-media-website

# 拉取最新代码
git pull origin main

# 重新安装依赖（如果有新依赖）
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..

# 重启服务
pm2 restart couple-media-server
```

## 🐛 故障排查

### 服务无法启动

```bash
# 查看详细日志
pm2 logs couple-media-server --lines 100

# 检查端口是否被占用
sudo netstat -tulpn | grep 3001

# 检查环境变量
cat ~/couple-media-website/server/.env
```

### 无法访问 API

```bash
# 检查服务是否运行
pm2 list

# 检查防火墙
sudo firewall-cmd --list-all

# 检查 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 文件上传失败

```bash
# 检查上传目录权限
ls -la ~/couple-media-website/server/uploads

# 设置正确的权限
chmod -R 755 ~/couple-media-website/server/uploads

# 检查磁盘空间
df -h
```

## ✅ 部署检查清单

- [ ] Node.js >= 16.0.0 已安装
- [ ] Git 已安装并配置 SSH 密钥
- [ ] PM2 已安装
- [ ] FFmpeg 已安装（可选）
- [ ] 项目代码已克隆
- [ ] 依赖已安装
- [ ] 前端已构建
- [ ] 环境变量已配置
- [ ] 服务已启动并运行
- [ ] 防火墙端口已开放
- [ ] Nginx 已配置（如需要）
- [ ] SSL 证书已配置（如需要）

## 📞 获取帮助

如果遇到问题：
1. 查看 PM2 日志：`pm2 logs couple-media-server`
2. 查看 Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
3. 检查系统资源：`htop` 或 `top`

---

**祝部署顺利！** 🎉


