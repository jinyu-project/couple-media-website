import Album from '../models/Album.model.js'

// 创建相册
export const createAlbum = async (req, res) => {
  try {
    console.log('📁 创建相册:', req.body)
    
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接，无法创建相册'
      })
    }
    
    const albumData = {
      name: req.body.name || '未命名相册',
      description: req.body.description || '',
      files: [],
      createdBy: req.body.userId || '000000000000000000000000',
      isPrivate: req.body.isPrivate || false,
      tags: req.body.tags || [],
    }
    
    const album = await Album.create(albumData)
    console.log(`✅ 相册创建成功: ${album.name}`)
    
    res.status(201).json({
      status: 'success',
      message: '相册创建成功',
      data: {
        album
      }
    })
  } catch (error) {
    console.error('❌ 创建相册失败:', error)
    res.status(500).json({
      status: 'error',
      message: '创建相册失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取所有相册
export const getAlbums = async (req, res) => {
  try {
    // 检查MongoDB连接状态
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        status: 'success',
        data: {
          albums: [],
          total: 0
        }
      })
    }
    
    const Album = (await import('../models/Album.model.js')).default
    const albums = await Album.find().lean()
    const total = await Album.countDocuments()
    
    res.status(200).json({
      status: 'success',
      data: {
        albums,
        total
      }
    })
  } catch (error) {
    console.error('❌ 获取相册列表失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取相册列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取相册详情
export const getAlbumById = async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接'
      })
    }
    
    const album = await Album.findById(req.params.id)
      .populate('files')
      .populate('createdBy', 'name email')
      .lean()
    
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        album
      }
    })
  } catch (error) {
    console.error('❌ 获取相册详情失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取相册详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 更新相册信息
export const updateAlbum = async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接'
      })
    }
    
    const album = await Album.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    res.status(200).json({
      status: 'success',
      message: '相册信息更新成功',
      data: {
        album
      }
    })
  } catch (error) {
    console.error('❌ 更新相册信息失败:', error)
    res.status(500).json({
      status: 'error',
      message: '更新相册信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 删除相册
export const deleteAlbum = async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接'
      })
    }
    
    const album = await Album.findByIdAndDelete(req.params.id)
    
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    // 清除文件中对该相册的引用
    const File = (await import('../models/File.model.js')).default
    await File.updateMany(
      { albumId: req.params.id },
      { $unset: { albumId: 1 } }
    )
    
    res.status(200).json({
      status: 'success',
      message: '相册删除成功'
    })
  } catch (error) {
    console.error('❌ 删除相册失败:', error)
    res.status(500).json({
      status: 'error',
      message: '删除相册失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 向相册添加文件
export const addFileToAlbum = async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接'
      })
    }
    
    const { fileId } = req.body
    if (!fileId) {
      return res.status(400).json({
        status: 'error',
        message: '请提供文件ID'
      })
    }
    
    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    // 检查文件是否已在相册中
    if (!album.files.includes(fileId)) {
      album.files.push(fileId)
      await album.save()
    }
    
    // 更新文件的albumId
    const File = (await import('../models/File.model.js')).default
    await File.findByIdAndUpdate(fileId, { albumId: req.params.id })
    
    res.status(200).json({
      status: 'success',
      message: '文件添加成功'
    })
  } catch (error) {
    console.error('❌ 添加文件失败:', error)
    res.status(500).json({
      status: 'error',
      message: '添加文件失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 从相册移除文件
export const removeFileFromAlbum = async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未连接'
      })
    }
    
    const { fileId } = req.params
    
    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    album.files = album.files.filter(id => id.toString() !== fileId)
    await album.save()
    
    // 清除文件的albumId
    const File = (await import('../models/File.model.js')).default
    await File.findByIdAndUpdate(fileId, { $unset: { albumId: 1 } })
    
    res.status(200).json({
      status: 'success',
      message: '文件移除成功'
    })
  } catch (error) {
    console.error('❌ 移除文件失败:', error)
    res.status(500).json({
      status: 'error',
      message: '移除文件失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

