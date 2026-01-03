import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads')
const photosDir = path.join(uploadsDir, 'photos')
const videosDir = path.join(uploadsDir, 'videos')
const docsDir = path.join(uploadsDir, 'docs')

;[uploadsDir, photosDir, videosDir, docsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// 文件类型映射
const fileTypeMap = {
  'image/jpeg': { type: 'photo', maxSize: 50 * 1024 * 1024, dir: photosDir },
  'image/jpg': { type: 'photo', maxSize: 50 * 1024 * 1024, dir: photosDir },
  'image/png': { type: 'photo', maxSize: 50 * 1024 * 1024, dir: photosDir },
  'image/webp': { type: 'photo', maxSize: 50 * 1024 * 1024, dir: photosDir },
  'image/gif': { type: 'photo', maxSize: 50 * 1024 * 1024, dir: photosDir },
  'video/mp4': { type: 'video', maxSize: 5 * 1024 * 1024 * 1024, dir: videosDir },
  'video/quicktime': { type: 'video', maxSize: 5 * 1024 * 1024 * 1024, dir: videosDir },
  'video/webm': { type: 'video', maxSize: 5 * 1024 * 1024 * 1024, dir: videosDir },
  'application/pdf': { type: 'document', maxSize: 20 * 1024 * 1024, dir: docsDir },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', maxSize: 20 * 1024 * 1024, dir: docsDir },
  'application/msword': { type: 'document', maxSize: 20 * 1024 * 1024, dir: docsDir },
  'text/plain': { type: 'document', maxSize: 20 * 1024 * 1024, dir: docsDir },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'document', maxSize: 20 * 1024 * 1024, dir: docsDir },
  'application/vnd.ms-excel': { type: 'document', maxSize: 20 * 1024 * 1024, dir: docsDir },
}

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileInfo = fileTypeMap[file.mimetype]
    if (fileInfo) {
      cb(null, fileInfo.dir)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原始文件名
    // 正确处理文件名编码（处理中文等特殊字符）
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    
    // 正确处理文件名编码
    let originalName
    try {
      // 尝试从 latin1 转换为 utf8（multer 默认使用 latin1）
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    } catch (e) {
      // 如果转换失败，直接使用原始名称
      originalName = file.originalname
    }
    
    const name = path.basename(originalName, ext)
    // 清理文件名中的特殊字符，但保留中文
    const safeName = name.replace(/[<>:"/\\|?*]/g, '_').trim()
    
    // 如果文件名为空，使用默认名称
    const finalName = safeName || 'file'
    
    // 使用 Buffer 确保文件名正确编码
    const encodedName = Buffer.from(`${finalName}-${uniqueSuffix}${ext}`, 'utf8').toString('utf8')
    cb(null, encodedName)
  }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const fileInfo = fileTypeMap[file.mimetype]
  if (fileInfo) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型。支持的类型：照片(jpg/png/webp/gif)、视频(mp4/mov/webm)、文档(pdf/docx/txt/xlsx)'), false)
  }
}

// 创建multer实例
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 最大5GB（视频的最大限制）
  }
})

// 文件大小验证中间件
export const validateFileSize = (req, res, next) => {
  if (!req.file) {
    return next()
  }

  const fileInfo = fileTypeMap[req.file.mimetype]
  if (fileInfo && req.file.size > fileInfo.maxSize) {
    // 删除已上传的文件
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    return res.status(400).json({
      status: 'error',
      message: `文件大小超过限制。${fileInfo.type === 'photo' ? '照片' : fileInfo.type === 'video' ? '视频' : '文档'}最大允许${fileInfo.maxSize / 1024 / 1024}MB`
    })
  }
  next()
}

// 获取文件类型信息
export const getFileTypeInfo = (mimetype) => {
  return fileTypeMap[mimetype] || null
}

