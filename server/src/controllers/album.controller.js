import { albumStorage, fileStorage } from '../utils/storage.util.js'

// 创建相册
export const createAlbum = async (req, res) => {
  try {
    
    const albumData = {
      name: req.body.name || '未命名相册',
      description: req.body.description || '',
      files: [],
      createdBy: req.body.userId || 'default-user',
      isPrivate: req.body.isPrivate || false,
      tags: req.body.tags || [],
    }
    
    const album = albumStorage.create(albumData)
    
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
    const albums = albumStorage.findAll()
    
    // 为每个相册获取文件详情（用于显示封面）
    const albumsWithFiles = albums.map(album => {
      if (album.files && album.files.length > 0) {
        // 获取文件详情
        const files = album.files
          .map(fileId => fileStorage.findById(fileId))
          .filter(Boolean)
        return {
          ...album,
          files
        }
      }
      return {
        ...album,
        files: []
      }
    })
    
    res.status(200).json({
      status: 'success',
      data: {
        albums: albumsWithFiles,
        total: albums.length
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
    const album = albumStorage.findById(req.params.id)
    
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    // 获取相册中的文件详情
    const files = album.files.map(fileId => fileStorage.findById(fileId)).filter(Boolean)
    
    res.status(200).json({
      status: 'success',
      data: {
        album: {
          ...album,
          files
        }
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
    const album = albumStorage.update(req.params.id, req.body)
    
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
    const album = albumStorage.findById(req.params.id)
    
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    // 清除文件中对该相册的引用
    const allFiles = fileStorage.findAll()
    allFiles.forEach(file => {
      if (file.albumId === req.params.id) {
        fileStorage.update(file.id, { albumId: null })
      }
    })
    
    albumStorage.delete(req.params.id)
    
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
    const { fileId } = req.body
    const albumId = req.params.id
    
    if (!fileId) {
      return res.status(400).json({
        status: 'error',
        message: '请提供文件ID'
      })
    }
    
    
    const album = albumStorage.findById(albumId)
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    const file = fileStorage.findById(fileId)
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      })
    }
    
    // 检查文件是否已在相册中（支持 id 和 _id 格式）
    const fileIdStr = fileId.toString()
    const isAlreadyInAlbum = album.files.some(id => {
      const idStr = id.toString()
      return idStr === fileIdStr || id === fileId
    })
    
    if (!isAlreadyInAlbum) {
      album.files.push(fileId)
      albumStorage.update(albumId, { files: album.files })
      } else {
    }
    
    // 更新文件的albumId
    fileStorage.update(fileId, { albumId: albumId })
    
    res.status(200).json({
      status: 'success',
      message: isAlreadyInAlbum ? '文件已在相册中' : '文件添加成功'
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
    const { fileId } = req.params
    const albumId = req.params.id
    
    
    const album = albumStorage.findById(albumId)
    if (!album) {
      return res.status(404).json({
        status: 'error',
        message: '相册不存在'
      })
    }
    
    // 支持 id 或 _id 格式
    album.files = album.files.filter(id => {
      const idStr = id.toString()
      const fileIdStr = fileId.toString()
      return idStr !== fileIdStr && (id !== fileId)
    })
    
    albumStorage.update(albumId, { files: album.files })
    
    // 清除文件的albumId
    const file = fileStorage.findById(fileId)
    if (file && (file.albumId === albumId || file.albumId === albumId.toString())) {
      fileStorage.update(fileId, { albumId: null })
    }
    
    
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
