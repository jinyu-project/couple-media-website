# 故障排查指南

## 问题：上传进度100%但文件没有显示

### 可能的原因和解决方案

#### 1. 后端服务未启动
**症状**: 显示"网络错误"，上传进度到100%但文件消失

**检查方法**:
- 打开浏览器开发者工具（F12）→ Network 标签
- 查看上传请求是否返回错误
- 检查后端服务是否在运行：`http://localhost:3001/api/health`

**解决方案**:
```bash
# 确保后端服务已启动
cd server
npm start
```

#### 2. MongoDB 未连接
**症状**: 文件上传成功但数据库保存失败

**检查方法**:
- 查看后端控制台是否有 MongoDB 连接错误
- 检查 MongoDB 是否运行

**解决方案**:
```bash
# 启动 MongoDB（如果使用本地 MongoDB）
# Windows: 确保 MongoDB 服务已启动
# 或使用 MongoDB Atlas 云数据库
```

#### 3. 文件路径问题
**症状**: 文件上传成功但预览失败

**检查方法**:
- 检查 `server/uploads/` 目录是否存在
- 检查文件是否实际保存到磁盘

**解决方案**:
- 确保 `server/uploads/` 目录有写入权限
- 检查后端日志中的文件路径信息

#### 4. CORS 跨域问题
**症状**: 浏览器控制台显示 CORS 错误

**检查方法**:
- 打开浏览器开发者工具 → Console 标签
- 查看是否有 CORS 相关错误

**解决方案**:
- 确保后端 CORS 配置正确（已在 `server/src/server.js` 中配置）
- 确保前端通过代理访问后端（Vite 已配置代理）

## 调试步骤

### 1. 检查后端服务
```bash
# 终端1：启动后端
cd server
npm start

# 应该看到：
# ✅ MongoDB 连接成功
# 🚀 服务器运行在 http://localhost:3001
```

### 2. 检查前端服务
```bash
# 终端2：启动前端
cd client
npm run dev

# 应该看到：
# VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:3000/
```

### 3. 检查网络请求
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试上传文件
4. 查看 `/api/files/upload` 请求：
   - **状态码**: 应该是 201（成功）
   - **响应**: 应该包含 `status: 'success'` 和文件数据
   - **错误**: 如果状态码是 4xx 或 5xx，查看响应内容

### 4. 检查后端日志
上传文件时，后端控制台应该显示：
```
📤 收到文件上传请求
📄 文件信息: xxx.jpg, 类型: image/jpeg, 大小: xxx bytes
✅ 文件已保存到: /path/to/uploads/photos/xxx.jpg
🔗 文件URL: /api/files/preview/photos/xxx.jpg
💾 保存文件元数据到数据库...
✅ 文件元数据已保存，ID: xxx
```

### 5. 检查数据库
```bash
# 如果使用 MongoDB Compass 或命令行
# 连接到数据库: couple-media
# 查看 collections → files
# 应该能看到上传的文件记录
```

## 常见错误信息

### "网络错误，请检查服务器连接"
- **原因**: 后端服务未启动或无法访问
- **解决**: 启动后端服务，检查端口 3001 是否被占用

### "不支持的文件类型"
- **原因**: 上传的文件类型不在允许列表中
- **解决**: 检查文件类型是否符合要求（照片：jpg/png/webp/gif，视频：mp4/mov/webm，文档：pdf/docx/txt/xlsx）

### "文件大小超过限制"
- **原因**: 文件超过最大限制
- **解决**: 照片最大 5MB，视频最大 100MB，文档最大 20MB

### "MongoDB 连接失败"
- **原因**: MongoDB 服务未启动或连接字符串错误
- **解决**: 
  - 启动本地 MongoDB 服务
  - 或修改 `.env` 文件中的 `MONGODB_URI` 为正确的连接字符串

## 快速测试

### 测试后端健康检查
```bash
curl http://localhost:3001/api/health
# 应该返回: {"status":"success","message":"服务运行正常",...}
```

### 测试文件上传
```bash
curl -X POST http://localhost:3001/api/files/upload \
  -F "file=@test.jpg"
# 应该返回文件信息
```

### 测试文件列表
```bash
curl http://localhost:3001/api/files/type/photo
# 应该返回文件列表
```

## 如果问题仍然存在

1. **查看完整错误日志**:
   - 浏览器控制台（F12 → Console）
   - 后端终端输出
   - 网络请求详情（F12 → Network）

2. **检查文件权限**:
   - 确保 `server/uploads/` 目录有写入权限

3. **检查端口占用**:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3001
   lsof -i :3000
   ```

4. **重新安装依赖**:
   ```bash
   # 后端
   cd server
   rm -rf node_modules
   npm install
   
   # 前端
   cd client
   rm -rf node_modules
   npm install
   ```

