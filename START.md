# 启动项目指南

## 方法一：使用根目录脚本（推荐）✨

### 首次使用需要安装依赖

```bash
# 在项目根目录执行
npm install
```

这会安装 `concurrently` 工具，用于同时运行前后端。

### 启动项目

```bash
# 在项目根目录执行（同时启动前后端）
npm run dev
```

或者：

```bash
npm start
```

**优点**：
- ✅ 一个命令同时启动前后端
- ✅ 日志会显示在同一个终端，用不同颜色区分
- ✅ 按 `Ctrl+C` 可以同时停止两个服务

**输出示例**：
```
[0] 🚀 服务器运行在 http://localhost:3001
[1] VITE v5.0.8  ready in 500 ms
[1] ➜  Local:   http://localhost:3000/
```

---

## 方法二：使用两个终端窗口（简单直接）

### 终端 1 - 启动后端

```bash
cd server
npm start
```

### 终端 2 - 启动前端

```bash
cd client
npm run dev
```

**优点**：
- ✅ 简单直接，不需要额外工具
- ✅ 可以分别查看前后端日志
- ✅ 可以分别停止前后端

**缺点**：
- ❌ 需要打开两个终端窗口
- ❌ 需要分别管理两个进程

---

## 方法三：使用 PowerShell 后台运行（Windows）

### 在同一个终端中

```powershell
# 启动后端（后台运行）
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# 启动前端（当前终端）
cd client
npm run dev
```

或者使用 `&` 操作符：

```powershell
# 启动后端（后台运行）
cd server; Start-Job -ScriptBlock { npm start }

# 启动前端（当前终端）
cd client
npm run dev
```

---

## 方法四：使用 VS Code 终端分屏

如果你使用 VS Code：

1. 打开终端（`` Ctrl+` ``）
2. 点击终端右上角的 **"+"** 旁边的下拉箭头
3. 选择 **"Split Terminal"**（分割终端）
4. 在左侧终端运行后端，右侧终端运行前端

---

## 推荐工作流程

### 开发时推荐使用方法一（根目录脚本）

```bash
# 1. 首次安装依赖
npm run install:all

# 2. 启动开发环境
npm run dev
```

### 调试时推荐使用方法二（两个终端）

- 可以更清楚地看到前后端的日志
- 可以单独重启某个服务

---

## 停止服务

### 方法一（根目录脚本）
- 按 `Ctrl+C` 一次，会同时停止前后端

### 方法二（两个终端）
- 在每个终端分别按 `Ctrl+C`

---

## 常见问题

### Q: 使用 `npm run dev` 时端口被占用怎么办？

**A:** 确保：
1. 没有其他实例在运行
2. 检查端口 3000 和 3001 是否被占用
3. 关闭占用端口的进程后重试

### Q: 如何只启动后端或前端？

**A:** 
```bash
# 只启动后端
npm run dev:server

# 只启动前端
npm run dev:client
```

### Q: concurrently 安装失败？

**A:** 确保网络连接正常，或使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

