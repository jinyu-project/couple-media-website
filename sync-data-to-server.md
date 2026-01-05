# 数据迁移指南：将本地数据同步到服务器

## 说明

本地和服务器使用独立的数据存储：
- **数据文件**：`server/data/files.json`、`server/data/albums.json`
- **上传的文件**：`server/uploads/` 目录下的照片、视频、文档

## 方法一：使用 SCP 命令（推荐）

### 步骤 1：在本地打包数据

```bash
# 在项目根目录执行
cd server

# 创建临时目录
mkdir -p temp_sync

# 复制数据文件
cp data/files.json temp_sync/
cp data/albums.json temp_sync/

# 复制上传的文件（如果文件很大，可能需要压缩）
cp -r uploads temp_sync/

# 打包
cd temp_sync
tar -czf ../data-sync.tar.gz .
cd ..
```

### 步骤 2：上传到服务器

```bash
# 从本地执行（替换为您的服务器信息）
scp server/data-sync.tar.gz admin@39.97.243.8:/home/admin/
```

### 步骤 3：在服务器上解压并恢复

```bash
# 在服务器上执行
cd ~/couple-media-website/server

# 备份现有数据
mkdir -p backup
cp data/files.json backup/ 2>/dev/null || true
cp data/albums.json backup/ 2>/dev/null || true

# 解压上传的数据
tar -xzf ~/data-sync.tar.gz -C .

# 恢复数据文件
cp files.json data/
cp albums.json data/

# 恢复上传的文件（合并，不覆盖）
cp -r uploads/* uploads/ 2>/dev/null || true

# 清理
rm -rf temp_sync files.json albums.json uploads
rm ~/data-sync.tar.gz

# 重启服务
cd ~/couple-media-website
pm2 restart couple-media-server
```

## 方法二：使用 Git（如果文件不太大）

### 步骤 1：将数据文件添加到 Git（临时）

```bash
# 注意：通常数据文件不应该提交到 Git
# 这只是临时方案

cd server
git add data/files.json data/albums.json
git commit -m "临时：同步数据到服务器"
git push origin main
```

### 步骤 2：在服务器上拉取

```bash
cd ~/couple-media-website
git pull origin main
pm2 restart couple-media-server
```

**注意**：上传的文件（`uploads/` 目录）无法通过 Git 同步，需要使用 SCP 或其他文件传输方式。

## 方法三：直接使用 rsync（推荐，适合大文件）

### 在本地执行

```bash
# 同步数据文件
rsync -avz server/data/files.json admin@39.97.243.8:/home/admin/couple-media-website/server/data/
rsync -avz server/data/albums.json admin@39.97.243.8:/home/admin/couple-media-website/server/data/

# 同步上传的文件（可能需要较长时间）
rsync -avz server/uploads/ admin@39.97.243.8:/home/admin/couple-media-website/server/uploads/
```

## 方法四：手动上传（适合少量文件）

1. 使用 FTP/SFTP 客户端（如 FileZilla、WinSCP）
2. 连接到服务器
3. 上传 `server/data/` 目录下的 JSON 文件
4. 上传 `server/uploads/` 目录下的文件

## 注意事项

1. **文件大小**：如果上传的文件很大，上传可能需要较长时间
2. **备份**：迁移前建议备份服务器上的现有数据
3. **权限**：确保服务器上的文件权限正确
4. **磁盘空间**：确保服务器有足够的磁盘空间

## 验证迁移

迁移完成后，在服务器上执行：

```bash
# 检查数据文件
cat ~/couple-media-website/server/data/files.json | head -20

# 检查文件数量
ls -la ~/couple-media-website/server/uploads/photos/ | wc -l
ls -la ~/couple-media-website/server/uploads/videos/ | wc -l

# 重启服务
pm2 restart couple-media-server

# 测试 API
curl http://localhost:3002/api/files/type/photo | head -50
```


