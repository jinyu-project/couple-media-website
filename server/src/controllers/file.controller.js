import File from '../models/File.model.js'
import { getFileUrl, deleteFile as deleteFileUtil } from '../utils/file.util.js'
import { getFileTypeInfo } from '../middleware/upload.middleware.js'
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

    console.log(`📄 文件信息: ${req.file.originalname}, 类型: ${req.file.mimetype}, 大小: ${req.file.size} bytes`)

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
    const fileData = {
      name: path.basename(req.file.filename, path.extname(req.file.filename)),
      originalName: req.file.originalname,
      type: fileInfo.type,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: req.body.userId || '000000000000000000000000', // 临时占位，后续从token获取
      albumId: req.body.albumId || null,
      description: req.body.description || '',
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',')) : [],
    }

    // 如果是图片，尝试生成缩略图URL（暂时使用原图）
    if (fileInfo.type === 'photo') {
      fileData.thumbnailUrl = fileUrl
    }

    console.log('💾 保存文件元数据到数据库...')
    const file = await File.create(fileData)
    console.log(`✅ 文件元数据已保存，ID: ${file._id}`)

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
    
    // 检查MongoDB连接状态
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未连接，返回空列表')
      return res.status(200).json({
        status: 'success',
        data: {
          files: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        }
      })
    }
    
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }
    
    // 构建排序
    const sortOrder = sort === 'asc' ? 1 : -1
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // 查询文件（populate失败时使用可选链）
    let files
    try {
      files = await File.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'name email')
        .populate('albumId', 'name')
        .lean()
    } catch (populateError) {
      console.log('⚠️ populate 失败，尝试不populate:', populateError.message)
      // 如果populate失败，尝试不populate
      files = await File.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    }
    
    const total = await File.countDocuments(query)
    
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
    
    // 检查MongoDB连接状态
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未连接，返回空列表')
      return res.status(200).json({
        status: 'success',
        data: {
          files: [],
          type: req.params.type,
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        }
      })
    }
    
    const { type } = req.params
    const { page = 1, limit = 20, sort = 'desc' } = req.query
    
    if (!['photo', 'video', 'document'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的文件类型'
      })
    }
    
    const sortOrder = sort === 'asc' ? 1 : -1
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // 查询文件（populate失败时使用可选链）
    let files
    try {
      files = await File.find({ type })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'name email')
        .populate('albumId', 'name')
        .lean()
    } catch (populateError) {
      console.log('⚠️ populate 失败，尝试不populate:', populateError.message)
      files = await File.find({ type })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    }
    
    const total = await File.countDocuments({ type })
    
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
    const file = await File.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('albumId', 'name')
      .lean()
    
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
    console.log(`📝 更新文件信息: ${req.params.id}`, req.body)
    
    // 检查MongoDB连接状态
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接，无法更新文件信息'
      })
    }
    
    // 先尝试不populate更新
    let file
    try {
      file = await File.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
      
      if (!file) {
        return res.status(404).json({
          status: 'error',
          message: '文件不存在'
        })
      }
      
      // 尝试populate，如果失败就返回不populate的数据
      try {
        await file.populate('uploadedBy', 'name email')
        await file.populate('albumId', 'name')
      } catch (populateError) {
        console.log('⚠️ populate 失败，返回不populate的数据:', populateError.message)
        // 继续执行，返回不populate的数据
      }
      
      console.log(`✅ 文件信息更新成功: ${file.name}`)
      
      res.status(200).json({
        status: 'success',
        message: '文件信息更新成功',
        data: {
          file: file.toObject ? file.toObject() : file
        }
      })
    } catch (updateError) {
      console.error('❌ 更新文件失败:', updateError)
      throw updateError
    }
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
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    // 删除物理文件
    const filePath = path.join(__dirname, '../../uploads', file.url.replace('/api/files/preview/', ''))
    await deleteFileUtil(filePath)
    
    // 删除数据库记录
    await File.findByIdAndDelete(req.params.id)
    
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
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    file.isFavorite = !file.isFavorite
    await file.save()
    
    res.status(200).json({
      status: 'success',
      message: file.isFavorite ? '已收藏' : '已取消收藏',
      data: {
        isFavorite: file.isFavorite
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

