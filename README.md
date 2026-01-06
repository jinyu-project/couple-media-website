# 情侣专属存储空间

一个用于情侣专属照片、视频、文档和小说存储管理的全栈项目。

## 📋 项目简介

这是一个专为情侣设计的私有存储空间系统，支持照片、视频、文档和小说等多种类型文件的存储和管理。系统采用前后端分离架构，提供友好的用户界面和完整的文件管理功能。

## ✨ 核心功能

### 📸 文件管理
- **照片管理**：上传、浏览、删除照片，支持缩略图预览
- **视频管理**：上传、播放视频，自动生成缩略图
- **文档管理**：支持 PDF、Word、Excel 等文档类型
- **文件搜索**：按文件名、类型快速搜索
- **收藏功能**：收藏喜欢的文件，快速访问

### 📚 小说模块
- **小说管理**：创建、编辑小说，上传封面图
- **章节管理**：添加、编辑章节，支持富文本编辑
- **阅读体验**：分页阅读，目录导航，宋体字体
- **自动保存**：章节内容每 30 秒自动保存草稿

### 📁 相册管理
- **相册创建**：创建自定义相册
- **文件分组**：将文件添加到相册中
- **相册浏览**：按相册查看文件

### 🏠 数据概览
- **统计信息**：显示照片、视频、文档、小说数量
- **最近访问**：快速访问最近查看的文件
- **收藏夹**：查看所有收藏的文件

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS v3** - 样式框架
- **shadcn/ui** - UI 组件库
- **React Router v6** - 路由管理
- **React Quill** - 富文本编辑器
- **@tailwindcss/typography** - 排版插件

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **JSON 文件存储** - 轻量级数据存储
- **Multer** - 文件上传处理
- **fluent-ffmpeg** - 视频处理（缩略图生成）

### 部署
- **PM2** - 进程管理
- **Nginx** - 反向代理和静态文件服务
- **阿里云轻量应用服务器** - 服务器环境

## 📁 项目结构

```
couple-media-website/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── layout/    # 布局组件
│   │   │   ├── file/      # 文件相关组件
│   │   │   ├── album/     # 相册组件
│   │   │   └── ui/        # UI 组件
│   │   ├── pages/         # 页面
│   │   │   ├── Home.jsx           # 首页
│   │   │   ├── Photos.jsx         # 照片页面
│   │   │   ├── Videos.jsx         # 视频页面
│   │   │   ├── Documents.jsx      # 文档页面
│   │   │   ├── Novels.jsx         # 小说列表
│   │   │   ├── NovelDetail.jsx    # 小说详情
│   │   │   ├── ChapterEdit.jsx    # 章节编辑
│   │   │   └── ChapterView.jsx    # 章节阅读
│   │   ├── router/        # 路由配置
│   │   └── lib/           # 工具函数
│   └── package.json
│
├── server/                 # 后端项目
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由
│   │   ├── utils/         # 工具类
│   │   │   ├── storage.util.js    # 数据存储工具
│   │   │   ├── video.util.js      # 视频处理工具
│   │   │   └── file.util.js       # 文件工具
│   │   └── server.js      # 服务器入口
│   ├── data/              # 数据文件（JSON）
│   │   ├── files.json     # 文件数据
│   │   ├── albums.json    # 相册数据
│   │   ├── novels.json    # 小说数据
│   │   └── chapters.json  # 章节数据
│   ├── uploads/           # 上传文件目录
│   │   ├── photos/        # 照片
│   │   ├── videos/        # 视频
│   │   └── novel-covers/  # 小说封面
│   └── package.json
│
├── ecosystem.config.js    # PM2 配置文件
├── nginx.conf.example     # Nginx 配置示例
└── package.json           # 根目录配置
```

## 🚀 快速开始

### 前置要求
- Node.js >= 16.0.0
- npm 或 yarn
- FFmpeg（用于视频缩略图生成，可选）

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 环境配置

1. 复制后端环境变量示例文件：
```bash
cd server
cp env.example .env
```

2. 修改 `.env` 文件：
```env
PORT=3002
NODE_ENV=development
JWT_SECRET=your-secret-key-here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### 启动开发环境

**方法一：同时启动前后端（推荐）**

```bash
npm run dev
```

这会同时启动：
- 后端服务：`http://localhost:3002`
- 前端应用：`http://localhost:5173`

**方法二：分别启动**

终端 1 - 后端：
```bash
cd server
npm run dev
```

终端 2 - 前端：
```bash
cd client
npm run dev
```

### 构建生产版本

```bash
# 构建前端
cd client
npm run build
```

构建产物将输出到 `client/dist` 目录。

## 📡 API 接口

### 文件相关 (`/api/files`)
- `GET /api/files` - 获取文件列表
- `GET /api/files/type/:type` - 根据类型获取文件（photo/video/document）
- `GET /api/files/:id` - 获取文件详情
- `POST /api/files/upload` - 上传文件
- `PUT /api/files/:id` - 更新文件信息
- `DELETE /api/files/:id` - 删除文件
- `POST /api/files/:id/favorite` - 收藏/取消收藏

### 相册相关 (`/api/albums`)
- `GET /api/albums` - 获取所有相册
- `GET /api/albums/:id` - 获取相册详情
- `POST /api/albums` - 创建相册
- `PUT /api/albums/:id` - 更新相册
- `DELETE /api/albums/:id` - 删除相册

### 小说相关 (`/api/novels`)
- `GET /api/novels` - 获取小说列表
- `GET /api/novels/:id` - 获取小说详情
- `POST /api/novels` - 创建小说
- `PUT /api/novels/:id` - 更新小说
- `DELETE /api/novels/:id` - 删除小说

### 章节相关 (`/api/novels/:novelId/chapters`)
- `GET /api/novels/:novelId/chapters` - 获取章节列表
- `GET /api/novels/:novelId/chapters/:id` - 获取章节详情
- `POST /api/novels/:novelId/chapters` - 创建章节
- `PUT /api/novels/:novelId/chapters/:id` - 更新章节
- `DELETE /api/novels/:novelId/chapters/:id` - 删除章节

## 📦 数据存储

项目使用 JSON 文件进行数据存储，数据文件位于 `server/data/` 目录：
- `files.json` - 文件元数据
- `albums.json` - 相册数据
- `novels.json` - 小说数据
- `chapters.json` - 章节数据
- `users.json` - 用户数据

上传的文件存储在 `server/uploads/` 目录下，按类型分类：
- `photos/` - 照片文件
- `videos/` - 视频文件
- `docs/` - 文档文件
- `novel-covers/` - 小说封面

## 🔐 配置信息

### 本地配置文件

项目包含一个本地配置文件 `config.local.md`，用于存储敏感信息（服务器密码、SSH 密钥等）。

**重要提示**：
- ⚠️ `config.local.md` 已添加到 `.gitignore`，不会提交到代码仓库
- 📝 首次使用需要创建此文件并填写相关信息
- 🔒 请妥善保管此文件，不要分享给他人
- 📋 文件模板已创建，请根据实际情况填写密码等信息

**创建配置文件**：
1. 复制 `config.local.md` 文件（如果不存在）
2. 填写服务器密码、SSH 密钥等敏感信息
3. 保存文件（已自动添加到 `.gitignore`）

配置文件包含：
- 服务器连接信息
- SSH 密钥信息
- GitHub 配置
- 常用命令参考

## 🌐 部署

项目已部署到阿里云轻量应用服务器，访问地址：`http://39.97.243.8`

详细的部署和上传教程请查看：[部署和上传指南](./DEPLOY_GUIDE.md)

## 📝 开发说明

### 当前功能状态
- ✅ 文件上传和管理
- ✅ 照片、视频、文档分类浏览
- ✅ 相册管理
- ✅ 小说模块（创建、编辑、阅读）
- ✅ 章节管理（富文本编辑、自动保存）
- ✅ 文件搜索和收藏
- ✅ 数据统计和概览

### 待优化功能
- [ ] 用户认证和权限管理
- [ ] 文件批量操作
- [ ] 文件分享功能
- [ ] 移动端适配优化

## 📄 许可证

MIT
