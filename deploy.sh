#!/bin/bash

# 情侣专属存储空间 - 部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
echo -e "${YELLOW}检查 Node.js 版本...${NC}"
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 16 ]; then
    echo -e "${RED}错误: 需要 Node.js >= 16.0.0${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 版本符合要求${NC}"

# 检查是否安装了 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}安装 PM2...${NC}"
    npm install -g pm2
fi

# 拉取最新代码
echo -e "${YELLOW}拉取最新代码...${NC}"
git pull origin main || echo "警告: Git pull 失败，继续使用当前代码"

# 安装依赖
echo -e "${YELLOW}安装后端依赖...${NC}"
cd server
npm install --production
cd ..

echo -e "${YELLOW}安装前端依赖...${NC}"
cd client
npm install
cd ..

# 构建前端
echo -e "${YELLOW}构建前端应用...${NC}"
cd client
npm run build
cd ..

# 创建必要的目录
echo -e "${YELLOW}创建必要的目录...${NC}"
mkdir -p server/logs
mkdir -p server/uploads/photos
mkdir -p server/uploads/videos
mkdir -p server/uploads/docs

# 检查环境变量文件
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}创建环境变量文件...${NC}"
    cp server/env.example server/.env
    echo -e "${RED}⚠️  请编辑 server/.env 文件配置环境变量！${NC}"
fi

# 使用 PM2 启动/重启服务
echo -e "${YELLOW}启动/重启服务...${NC}"
if pm2 list | grep -q "couple-media-server"; then
    echo -e "${YELLOW}服务已存在，重启中...${NC}"
    pm2 restart ecosystem.config.js
else
    echo -e "${YELLOW}启动新服务...${NC}"
    pm2 start ecosystem.config.js
fi

# 保存 PM2 配置
pm2 save

# 显示状态
echo -e "${GREEN}✓ 部署完成！${NC}"
echo ""
echo "服务状态:"
pm2 list
echo ""
echo "查看日志: pm2 logs couple-media-server"
echo "停止服务: pm2 stop couple-media-server"
echo "重启服务: pm2 restart couple-media-server"

