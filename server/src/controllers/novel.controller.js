import { novelStorage, chapterStorage } from '../utils/storage.util.js'
import { getFileUrl } from '../utils/file.util.js'

// 创建小说
export const createNovel = async (req, res) => {
  try {
    console.log('📚 创建小说:', req.body)
    
    const novelData = {
      title: req.body.title || '未命名小说',
      description: req.body.description || '',
      coverUrl: req.body.coverUrl || null,
      author: req.body.author || 'default-user',
      status: req.body.status || 'draft', // draft, serializing, completed
      tags: req.body.tags || [],
    }
    
    const novel = novelStorage.create(novelData)
    console.log(`✅ 小说创建成功: ${novel.title}`)
    
    res.status(201).json({
      status: 'success',
      message: '小说创建成功',
      data: {
        novel
      }
    })
  } catch (error) {
    console.error('❌ 创建小说失败:', error)
    res.status(500).json({
      status: 'error',
      message: '创建小说失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取所有小说
export const getNovels = async (req, res) => {
  try {
    const novels = novelStorage.findAll()
    
    // 为每个小说获取章节数
    const novelsWithChapters = novels.map(novel => {
      const chapters = chapterStorage.findAll({ novelId: novel.id })
      return {
        ...novel,
        chapterCount: chapters.length
      }
    })
    
    // 按更新时间排序
    novelsWithChapters.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    
    res.status(200).json({
      status: 'success',
      data: {
        novels: novelsWithChapters,
        total: novelsWithChapters.length
      }
    })
  } catch (error) {
    console.error('❌ 获取小说列表失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取小说列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取小说详情
export const getNovelById = async (req, res) => {
  try {
    const novel = novelStorage.findById(req.params.id)
    
    if (!novel) {
      return res.status(404).json({
        status: 'error',
        message: '小说不存在'
      })
    }
    
    // 获取小说的所有章节
    const chapters = chapterStorage.findAll({ novelId: novel.id })
    
    res.status(200).json({
      status: 'success',
      data: {
        novel: {
          ...novel,
          chapters,
          chapterCount: chapters.length
        }
      }
    })
  } catch (error) {
    console.error('❌ 获取小说详情失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取小说详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 更新小说信息
export const updateNovel = async (req, res) => {
  try {
    const novelId = req.params.id
    console.log(`📝 更新小说信息: ID=${novelId}`, req.body)
    console.log(`📝 当前所有小说:`, novelStorage.findAll().map(n => ({ id: n.id, title: n.title })))
    
    // 先检查小说是否存在
    const existingNovel = novelStorage.findById(novelId)
    if (!existingNovel) {
      console.log(`❌ 小说不存在: ID=${novelId}`)
      return res.status(404).json({
        status: 'error',
        message: '小说不存在'
      })
    }
    
    const novel = novelStorage.update(novelId, req.body)
    
    if (!novel) {
      console.log(`❌ 更新失败: ID=${novelId}`)
      return res.status(404).json({
        status: 'error',
        message: '小说不存在'
      })
    }
    
    console.log(`✅ 小说信息更新成功: ${novel.title}`)
    
    res.status(200).json({
      status: 'success',
      message: '小说信息更新成功',
      data: {
        novel
      }
    })
  } catch (error) {
    console.error('❌ 更新小说信息失败:', error)
    res.status(500).json({
      status: 'error',
      message: '更新小说信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 删除小说
export const deleteNovel = async (req, res) => {
  try {
    const novelId = req.params.id
    
    // 检查小说是否存在
    const novel = novelStorage.findById(novelId)
    if (!novel) {
      return res.status(404).json({
        status: 'error',
        message: '小说不存在'
      })
    }
    
    // 删除所有章节
    const chapters = chapterStorage.findAll({ novelId })
    chapters.forEach(chapter => {
      chapterStorage.delete(chapter.id)
    })
    
    // 删除小说
    novelStorage.delete(novelId)
    
    res.status(200).json({
      status: 'success',
      message: '小说删除成功'
    })
  } catch (error) {
    console.error('❌ 删除小说失败:', error)
    res.status(500).json({
      status: 'error',
      message: '删除小说失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

