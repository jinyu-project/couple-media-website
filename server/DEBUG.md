# 调试指南

## 500错误排查步骤

### 1. 查看后端控制台日志

启动后端后，查看终端输出，应该能看到：
- ✅ MongoDB 连接成功（或 ⚠️ MongoDB 连接失败）
- 🚀 服务器运行在 http://localhost:3001

### 2. 测试健康检查接口

在浏览器中访问：
```
http://localhost:3001/api/health
```

应该返回：
```json
{
  "status": "success",
  "message": "服务运行正常",
  "timestamp": "..."
}
```

### 3. 测试文件列表接口

在浏览器中访问：
```
http://localhost:3001/api/files/type/photo
```

**如果MongoDB未连接**，应该返回：
```json
{
  "status": "success",
  "data": {
    "files": [],
    "total": 0,
    ...
  }
}
```

**如果返回500错误**，查看后端控制台的错误信息。

### 4. 常见问题

#### 问题1: MongoDB未启动
**症状**: 后端控制台显示 `❌ MongoDB 连接失败`

**解决**:
- 启动本地MongoDB服务
- 或使用MongoDB Atlas云数据库
- 或修改 `.env` 文件中的 `MONGODB_URI`

**注意**: 即使MongoDB未连接，API也会返回空数据而不是500错误。

#### 问题2: 端口被占用
**症状**: 启动时显示 `EADDRINUSE` 错误

**解决**:
```bash
# Windows PowerShell
netstat -ano | findstr :3001
# 找到进程ID后
taskkill /PID <进程ID> /F
```

#### 问题3: 模块导入错误
**症状**: 启动时显示 `Cannot find module` 或 `SyntaxError`

**解决**:
```bash
cd server
rm -rf node_modules
npm install
```

### 5. 查看详细错误信息

后端控制台会显示详细的错误信息，包括：
- 📋 请求日志
- ❌ 错误信息
- ⚠️ 警告信息

### 6. 测试步骤

1. **启动后端**:
   ```bash
   cd server
   npm start
   ```

2. **测试健康检查**:
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **测试文件列表**:
   ```bash
   curl http://localhost:3001/api/files/type/photo
   ```

4. **查看后端日志**:
   - 应该看到 `📋 获取文件列表请求`
   - 应该看到 `✅ 返回 X 个文件`

### 7. 如果仍然500错误

请提供以下信息：
1. 后端控制台的完整错误信息
2. 浏览器Network标签中的请求详情
3. 访问的具体URL

