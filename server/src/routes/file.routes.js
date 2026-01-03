import express from 'express'
import * as fileController from '../controllers/file.controller.js'
import { upload, validateFileSize } from '../middleware/upload.middleware.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// 文件预览/下载接口（需要在其他路由之前定义，避免被/:id匹配）
router.get('/preview/*', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads', req.params[0])
    
    // 安全检查：确保文件在uploads目录内
    const uploadsDir = path.join(__dirname, '../../uploads')
    const resolvedPath = path.resolve(filePath)
    const resolvedUploads = path.resolve(uploadsDir)
    
    if (!resolvedPath.startsWith(resolvedUploads)) {
      return res.status(403).json({
        status: 'error',
        message: '访问被拒绝'
      })
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    // 设置响应头
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
    }
    
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    
    // 如果是下载请求
    if (req.query.download === 'true') {
      const fileName = path.basename(filePath)
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    }
    
    // 发送文件
    res.sendFile(filePath)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取文件失败',
      error: error.message
    })
  }
})

// 上传文件
router.post('/upload', upload.single('file'), validateFileSize, fileController.uploadFile)

// 获取文件列表
router.get('/', fileController.getFiles)

// 根据类型获取文件（照片、视频、文档）
router.get('/type/:type', fileController.getFilesByType)

// 获取文件详情
router.get('/:id', fileController.getFileById)

// 更新文件信息
router.put('/:id', fileController.updateFile)

// 删除文件
router.delete('/:id', fileController.deleteFileController)

// 收藏/取消收藏文件
router.post('/:id/favorite', fileController.toggleFavorite)

export default router

