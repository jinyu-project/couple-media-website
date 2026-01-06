# 部署和上传指南

本文档介绍如何将本地代码和数据上传到阿里云服务器。

## 📋 服务器信息

- **服务器 IP**：`39.97.243.8`
- **用户名**：`admin`
- **项目路径**：`/home/admin/couple-media-website`
- **后端端口**：`3002`
- **访问地址**：`http://39.97.243.8`

---

## ⚡ 快速开始：使用命令别名（推荐）

**加载命令别名：**
```powershell
. .\powershell-aliases.ps1
```

**然后就可以使用简短命令：**
```powershell
Setup-SSHKey      # 配置 SSH 密钥免密登录
Sync-Uploads      # 仅同步用户上传的内容
Sync-All          # 同步所有数据
Upload-Data       # 上传数据到服务器
Connect-Server    # SSH 连接到服务器
Show-DeployHelp   # 显示帮助信息
```

**详细命令参考请查看：`快速命令.md`**

---

## 🚀 一、上传代码到服务器（推荐：Git）

### 1. 本地提交代码

```bash
# 在项目根目录
git add .
git commit -m "更新说明"
git push origin main
```

### 2. 服务器拉取代码并部署

```bash
# SSH 连接到服务器
ssh admin@39.97.243.8

# 进入项目目录
cd /home/admin/couple-media-website

# 拉取最新代码
git pull origin main

# 安装后端依赖
cd server
npm install --production

# 安装前端依赖并构建
cd ../client
npm install
npm run build

# 设置文件权限
sudo chown -R www:www /home/admin/couple-media-website/client/dist

# 重启服务
cd ..
pm2 restart ecosystem.config.js
pm2 list
```

---

## 📦 二、上传数据文件到服务器（推荐：SCP）

**在本地 PowerShell 执行：**

```powershell
$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SERVER_PATH = "/home/admin/couple-media-website/server"

# 上传数据文件（JSON）
scp server/data/*.json ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/data/

# 上传照片文件
scp -r server/uploads/photos ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/

# 上传视频文件
scp -r server/uploads/videos ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/

# 上传小说封面（如果有）
scp -r server/uploads/novel-covers ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/
```

**上传完成后，在服务器上设置权限：**

```bash
ssh admin@39.97.243.8

# 设置文件权限
sudo chmod -R 755 /home/admin/couple-media-website/server/data/
sudo chmod -R 755 /home/admin/couple-media-website/server/uploads/

# 重启服务
cd /home/admin/couple-media-website
pm2 restart ecosystem.config.js
```

---

## 🔑 三、配置 SSH 密钥免密登录（推荐）

为了避免每次同步时都要输入密码，建议先配置 SSH 密钥免密登录。

### 在 PowerShell 中执行：

```powershell
# 方法一：使用脚本
.\setup-ssh-key.bat

# 方法二：手动配置（推荐）
# 1. 检查或生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa"

# 2. 复制公钥到服务器（需要输入一次密码）
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh admin@39.97.243.8 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 3. 测试免密登录
ssh admin@39.97.243.8 "echo '连接成功！'"
```

**配置完成后，所有同步操作都不需要再输入密码！**

---

## 📥 四、从服务器同步数据到本地

### 仅同步用户上传的内容（推荐）

**在 PowerShell 中执行：**

```powershell
# 方法一：使用脚本
.\sync-uploads-only.bat

# 方法二：直接执行命令（推荐）
$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SERVER_PATH = "/home/admin/couple-media-website/server"

# 下载照片文件
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/photos server/uploads/

# 下载视频文件
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/videos server/uploads/

# 下载小说封面（如果存在）
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/novel-covers server/uploads/ 2>$null
```

这会下载：
- ✅ 照片文件：`server/uploads/photos/`
- ✅ 视频文件：`server/uploads/videos/`
- ✅ 小说封面：`server/uploads/novel-covers/`
- ⚠️ **不会覆盖本地数据文件（JSON）**

### 同步所有数据（包括数据文件）

**在 PowerShell 中执行：**

```powershell
# 方法一：使用脚本
.\sync-from-server.bat

# 方法二：直接执行命令（推荐）
$SERVER_IP = "39.97.243.8"
$SERVER_USER = "admin"
$SERVER_PATH = "/home/admin/couple-media-website/server"

# 下载数据文件（JSON）
scp ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/data/*.json server/data/

# 下载照片文件
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/photos server/uploads/

# 下载视频文件
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/videos server/uploads/

# 下载小说封面（如果存在）
scp -r ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/uploads/novel-covers server/uploads/ 2>$null
```

**注意：** 这会覆盖本地的数据文件（JSON），建议先备份。

---

## 🔧 五、常见问题解决

### 问题 1：SSH 连接失败

**解决方法：**
1. 确认服务器密码正确
2. 在阿里云控制台重置密码
3. 确认服务器已重启（重置密码后必须重启）
4. 配置 SSH 密钥免密登录（运行 `setup-ssh-key.bat`）

### 问题 2：文件上传很慢

**解决方法：**
- 使用 WinSCP（有进度条显示）
- 或分批上传文件

### 问题 3：上传后文件看不到

**解决方法：**
```bash
# 检查文件权限
sudo chmod -R 755 /home/admin/couple-media-website/server/uploads/

# 重启服务
pm2 restart ecosystem.config.js
```

### 问题 4：Git pull 失败

**解决方法：**
```bash
# 测试 GitHub 连接
ssh -T git@github.com

# 如果失败，检查服务器 SSH 密钥是否添加到 GitHub
```

### 问题 6：同步时一直要输入密码

**解决方法：**
```powershell
# 配置 SSH 密钥免密登录
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh admin@39.97.243.8 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```
配置完成后就不需要再输入密码了。

### 问题 5：PM2 重启失败

**解决方法：**
```bash
# 停止所有 PM2 进程
pm2 stop all
pm2 delete all

# 重新启动
cd /home/admin/couple-media-website
pm2 start ecosystem.config.js
```

---

## 📞 六、需要帮助？

如果遇到问题，可以：
1. 查看服务器日志：`pm2 logs couple-media-server`
2. 检查 Nginx 日志：`sudo tail -f /www/server/nginx/logs/error.log`
3. 使用阿里云 Workbench 登录服务器排查问题
