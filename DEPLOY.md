# 服务器部署指南

本文档介绍如何将情侣专属存储空间项目部署到生产服务器。

## 📋 前置要求

### 服务器环境
- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0
- **Git**: 已安装并配置 SSH 密钥
- **FFmpeg**: 用于视频处理（可选，但推荐）

### 推荐配置
- **CPU**: 2 核以上
- **内存**: 2GB 以上
- **磁盘**: 20GB 以上（根据文件存储需求调整）
- **带宽**: 根据访问量调整

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

1. **克隆项目到服务器**
```bash
git clone git@github.com:jinyu-project/couple-media-website.git
cd couple-media-website
```

2. **给部署脚本添加执行权限**
```bash
chmod +x deploy.sh
```

3. **运行部署脚本**
```bash
./deploy.sh
```

4. **配置环境变量**
```bash
cd server
cp env.example .env
nano .env  # 或使用其他编辑器
```

编辑 `.env` 文件：
```env
PORT=3001
NODE_ENV=production

# JWT 配置
JWT_SECRET=your-strong-secret-key-here-change-this
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB
```

5. **重启服务使配置生效**
```bash
pm2 restart couple-media-server
```

### 方法二：手动部署

#### 1. 安装 Node.js 和 npm

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 2. 安装 PM2（进程管理器）
```bash
sudo npm install -g pm2
```

#### 3. 安装 FFmpeg（可选但推荐）
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg

# CentOS/RHEL
sudo yum install -y ffmpeg
```

#### 4. 克隆项目
```bash
git clone git@github.com:jinyu-project/couple-media-website.git
cd couple-media-website
```

#### 5. 安装依赖
```bash
# 后端依赖
cd server
npm install --production
cd ..

# 前端依赖和构建
cd client
npm install
npm run build
cd ..
```

#### 6. 配置环境变量
```bash
cd server
cp env.example .env
nano .env  # 编辑配置文件
```

#### 7. 创建必要的目录
```bash
mkdir -p server/logs
mkdir -p server/uploads/photos
mkdir -p server/uploads/videos
mkdir -p server/uploads/docs
```

#### 8. 启动服务
```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 保存 PM2 配置（开机自启）
pm2 save
pm2 startup  # 按照提示执行命令
```

## 🔧 配置 Nginx（反向代理）

### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt-get install -y nginx

# CentOS/RHEL
sudo yum install -y nginx
```

### 2. 配置 Nginx
```bash
# 复制配置示例
sudo cp nginx.conf.example /etc/nginx/sites-available/couple-media

# 编辑配置文件
sudo nano /etc/nginx/sites-available/couple-media
```

修改以下内容：
- `server_name`: 您的域名或 IP
- `root`: 前端构建文件的路径（通常是 `/path/to/couple-media-website/client/dist`）

### 3. 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/couple-media /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 📝 PM2 常用命令

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

# 保存当前进程列表
pm2 save
```

## 🔒 安全建议

### 1. 防火墙配置
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. SSL 证书（HTTPS）
推荐使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx  # Ubuntu/Debian
sudo yum install certbot python3-certbot-nginx      # CentOS/RHEL

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

### 3. 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用强密码作为 `JWT_SECRET`
- 定期更新依赖包：`npm audit fix`

## 🔄 更新部署

当代码更新后，重新部署：

```bash
# 方法一：使用部署脚本
./deploy.sh

# 方法二：手动更新
git pull origin main
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..
pm2 restart couple-media-server
```

## 📊 监控和日志

### 查看应用日志
```bash
# PM2 日志
pm2 logs couple-media-server

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 监控资源使用
```bash
# PM2 监控
pm2 monit

# 系统资源
htop  # 或 top
```

## 🐛 故障排查

### 服务无法启动
1. 检查端口是否被占用：`netstat -tulpn | grep 3001`
2. 查看 PM2 日志：`pm2 logs couple-media-server`
3. 检查环境变量配置：`cat server/.env`
4. 检查 Node.js 版本：`node -v`

### 前端无法访问后端 API
1. 检查 Nginx 配置中的 `proxy_pass` 是否正确
2. 检查后端服务是否运行：`pm2 list`
3. 检查防火墙规则
4. 查看 Nginx 错误日志

### 文件上传失败
1. 检查 `uploads` 目录权限：`chmod -R 755 server/uploads`
2. 检查磁盘空间：`df -h`
3. 检查文件大小限制（Nginx 和 Express 配置）

## 📞 获取帮助

如果遇到问题，请：
1. 查看日志文件
2. 检查 GitHub Issues
3. 联系项目维护者

## ✅ 部署检查清单

- [ ] Node.js >= 16.0.0 已安装
- [ ] PM2 已安装并配置
- [ ] 项目代码已克隆
- [ ] 依赖已安装
- [ ] 前端已构建
- [ ] 环境变量已配置
- [ ] 必要的目录已创建
- [ ] 服务已启动并运行
- [ ] Nginx 已配置（如需要）
- [ ] 防火墙已配置
- [ ] SSL 证书已配置（如需要）
- [ ] 日志监控已设置

---

**祝部署顺利！** 🎉

