import { fileStorage } from '../utils/storage.util.js'
import { getFileUrl, deleteFile as deleteFileUtil } from '../utils/file.util.js'
import { getFileTypeInfo } from '../middleware/upload.middleware.js'
import { extractVideoThumbnail } from '../utils/video.util.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 上传文件
export const uploadFile = async (req, res) => {
  try {
    console.log('📤 收到文件上传请求')
    
    if (!req.file) {
      console.log('❌ 未收到文件')
      return res.status(400).json({
        status: 'error',
        message: '请选择要上传的文件'
      })
    }

    // 正确处理文件名编码（处理中文等特殊字符）
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    console.log(`📄 文件信息: ${originalName}, 类型: ${req.file.mimetype}, 大小: ${req.file.size} bytes`)

    const fileInfo = getFileTypeInfo(req.file.mimetype)
    if (!fileInfo) {
      console.log(`❌ 不支持的文件类型: ${req.file.mimetype}`)
      // 删除已上传的文件
      if (fs.existsSync(req.file.path)) {
        await deleteFileUtil(req.file.path)
      }
      return res.status(400).json({
        status: 'error',
        message: '不支持的文件类型'
      })
    }

    // 验证文件大小
    if (req.file.size > fileInfo.maxSize) {
      console.log(`❌ 文件大小超过限制: ${req.file.size} > ${fileInfo.maxSize}`)
      await deleteFileUtil(req.file.path)
      return res.status(400).json({
        status: 'error',
        message: `文件大小超过限制。${fileInfo.type === 'photo' ? '照片' : fileInfo.type === 'video' ? '视频' : '文档'}最大允许${fileInfo.maxSize / 1024 / 1024}MB`
      })
    }

    // 获取文件URL
    const fileUrl = getFileUrl(req.file.path)
    console.log(`✅ 文件已保存到: ${req.file.path}`)
    console.log(`🔗 文件URL: ${fileUrl}`)

    // 创建文件元数据
    // 使用之前已经处理好的文件名编码
    const fileData = {
      name: originalName, // 使用原始文件名作为显示名称（正确编码）
      originalName: originalName,
      type: fileInfo.type,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: req.body.userId || 'default-user',
      albumId: req.body.albumId || null,
      description: req.body.description || '',
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',')) : [],
      isFavorite: false,
    }

    // 如果是图片，尝试生成缩略图URL（暂时使用原图）
    if (fileInfo.type === 'photo') {
      fileData.thumbnailUrl = fileUrl
    }
    
    // 如果是视频，提取第一帧作为封面
    if (fileInfo.type === 'video') {
      try {
        console.log('🎬 开始提取视频第一帧作为封面...')
        console.log(`📹 视频文件路径: ${req.file.path}`)
        const thumbnailPath = await extractVideoThumbnail(req.file.path)
        console.log(`📸 缩略图路径: ${thumbnailPath}`)
        
        // 检查缩略图文件是否存在
        if (!fs.existsSync(thumbnailPath)) {
          throw new Error('缩略图文件未生成')
        }
        
        const thumbnailUrl = getFileUrl(thumbnailPath)
        fileData.thumbnailUrl = thumbnailUrl
        console.log(`✅ 视频封面提取成功: ${thumbnailUrl}`)
      } catch (error) {
        console.error('❌ 视频封面提取失败:', error.message)
        console.error('错误堆栈:', error.stack)
        console.warn('⚠️ 使用默认封面')
        // 如果提取失败，使用默认封面
        fileData.thumbnailUrl = '/api/files/preview/default-video-cover.svg'
      }
    }

    console.log('💾 保存文件元数据到本地存储...')
    const file = fileStorage.create(fileData)
    console.log(`✅ 文件元数据已保存，ID: ${file.id}`)

    res.status(201).json({
      status: 'success',
      message: '文件上传成功',
      data: {
        file
      }
    })
  } catch (error) {
    console.error('❌ 文件上传失败:', error)
    // 如果创建失败，删除已上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🗑️ 删除已上传的文件...')
      await deleteFileUtil(req.file.path)
    }
    res.status(500).json({
      status: 'error',
      message: '文件上传失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取文件列表
export const getFiles = async (req, res) => {
  try {
    console.log('📋 获取文件列表请求')
    
    const { type, page = 1, limit = 20, sort = 'desc', isFavorite, search } = req.query
    
    // 构建查询条件
    const query = {}
    if (type && ['photo', 'video', 'document'].includes(type)) {
      query.type = type
    }
    if (isFavorite === 'true') {
      query.isFavorite = true
    }
    if (search) {
      query.search = search
    }
    
    // 获取所有文件
    let files = fileStorage.findAll(query)
    
    // 排序
    const sortOrder = sort === 'asc' ? 1 : -1
    files.sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortOrder === 1 ? dateA - dateB : dateB - dateA
    })
    
    // 分页
    const total = files.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    files = files.slice(skip, skip + parseInt(limit))
    
    console.log(`✅ 返回 ${files.length} 个文件，总计 ${total}`)
    
    res.status(200).json({
      status: 'success',
      data: {
        files,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('❌ 获取文件列表失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取文件列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 根据类型获取文件
export const getFilesByType = async (req, res) => {
  try {
    console.log(`📋 获取 ${req.params.type} 类型文件列表`)
    
    const { type } = req.params
    const { page = 1, limit = 20, sort = 'desc' } = req.query
    
    if (!['photo', 'video', 'document'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的文件类型'
      })
    }
    
    // 获取指定类型的文件
    let files = fileStorage.findAll({ type })
    
    // 排序
    const sortOrder = sort === 'asc' ? 1 : -1
    files.sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortOrder === 1 ? dateA - dateB : dateB - dateA
    })
    
    // 分页
    const total = files.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    files = files.slice(skip, skip + parseInt(limit))
    
    console.log(`✅ 返回 ${files.length} 个 ${type} 文件，总计 ${total}`)
    
    res.status(200).json({
      status: 'success',
      data: {
        files,
        type,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('❌ 获取文件列表失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取文件列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取文件详情
export const getFileById = async (req, res) => {
  try {
    const file = fileStorage.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        file
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取文件详情失败',
      error: error.message
    })
  }
}

// 更新文件信息
export const updateFile = async (req, res) => {
  try {
    const fileId = req.params.id
    console.log(`📝 更新文件信息: ID=${fileId}`, req.body)
    
    // 先检查文件是否存在
    const existingFile = fileStorage.findById(fileId)
    if (!existingFile) {
      console.log(`❌ 文件不存在: ID=${fileId}`)
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    console.log(`✅ 找到文件: ${existingFile.name} (ID: ${existingFile.id}, _id: ${existingFile._id})`)
    
    const file = fileStorage.update(fileId, req.body)
    
    if (!file) {
      console.log(`❌ 更新失败: ID=${fileId}`)
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    console.log(`✅ 文件信息更新成功: ${file.name}`)
    
    res.status(200).json({
      status: 'success',
      message: '文件信息更新成功',
      data: {
        file
      }
    })
  } catch (error) {
    console.error('❌ 更新文件信息失败:', error)
    res.status(500).json({
      status: 'error',
      message: '更新文件信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 删除文件
export const deleteFileController = async (req, res) => {
  try {
    const file = fileStorage.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    // 删除物理文件
    const filePath = path.join(__dirname, '../../uploads', file.url.replace('/api/files/preview/', ''))
    await deleteFileUtil(filePath)
    
    // 如果是视频文件，同时删除缩略图
    if (file.type === 'video' && file.thumbnailUrl) {
      try {
        const thumbnailPath = path.join(__dirname, '../../uploads', file.thumbnailUrl.replace('/api/files/preview/', ''))
        // 只删除缩略图文件（不是默认封面SVG）
        if (fs.existsSync(thumbnailPath) && !thumbnailPath.endsWith('default-video-cover.svg')) {
          await deleteFileUtil(thumbnailPath)
          console.log(`🗑️ 已删除视频缩略图: ${thumbnailPath}`)
        }
      } catch (thumbError) {
        console.warn('⚠️ 删除缩略图失败:', thumbError.message)
        // 继续执行，不因为缩略图删除失败而中断
      }
    }
    
    // 删除数据库记录
    fileStorage.delete(req.params.id)
    
    res.status(200).json({
      status: 'success',
      message: '文件删除成功'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '删除文件失败',
      error: error.message
    })
  }
}

// 收藏/取消收藏文件
export const toggleFavorite = async (req, res) => {
  try {
    const file = fileStorage.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    const updatedFile = fileStorage.update(req.params.id, {
      isFavorite: !file.isFavorite
    })
    
    res.status(200).json({
      status: 'success',
      message: updatedFile.isFavorite ? '已收藏' : '已取消收藏',
      data: {
        isFavorite: updatedFile.isFavorite
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '操作失败',
      error: error.message
    })
  }
}
