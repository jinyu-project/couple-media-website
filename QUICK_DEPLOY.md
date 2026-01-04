# 快速部署指南

## 🚀 一键部署（推荐）

```bash
# 1. 克隆项目
git clone git@github.com:jinyu-project/couple-media-website.git
cd couple-media-website

# 2. 给脚本添加执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
./deploy.sh

# 4. 配置环境变量
cd server
cp env.example .env
nano .env  # 编辑配置

# 5. 重启服务
pm2 restart couple-media-server
```

## 📋 部署后检查

```bash
# 检查服务状态
pm2 list

# 查看日志
pm2 logs couple-media-server

# 测试 API
curl http://localhost:3001/api/health
```

## 🔧 常用命令

```bash
# 启动服务
npm run pm2:start
# 或
pm2 start ecosystem.config.js

# 停止服务
npm run pm2:stop
# 或
pm2 stop couple-media-server

# 重启服务
npm run pm2:restart
# 或
pm2 restart couple-media-server

# 查看日志
npm run pm2:logs
# 或
pm2 logs couple-media-server

# 更新代码后重新部署
git pull
./deploy.sh
```

## ⚙️ 环境变量配置

编辑 `server/.env` 文件：

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

## 🌐 Nginx 配置

1. 复制配置示例：
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/couple-media
```

2. 编辑配置文件，修改域名和路径：
```bash
sudo nano /etc/nginx/sites-available/couple-media
```

3. 启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/couple-media /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📚 详细文档

更多详细信息请查看 [DEPLOY.md](./DEPLOY.md)

