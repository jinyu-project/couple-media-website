import { chapterStorage, novelStorage } from '../utils/storage.util.js'

// 创建章节
export const createChapter = async (req, res) => {
  try {
    const { novelId } = req.params
    
    // 检查小说是否存在
    const novel = novelStorage.findById(novelId)
    if (!novel) {
      return res.status(404).json({
        status: 'error',
        message: '小说不存在'
      })
    }
    
    const chapterData = {
      novelId,
      title: req.body.title || '未命名章节',
      content: req.body.content || '',
      order: req.body.order,
      isDraft: req.body.isDraft !== undefined ? req.body.isDraft : false,
    }
    
    const chapter = chapterStorage.create(chapterData)
    
    res.status(201).json({
      status: 'success',
      message: '章节创建成功',
      data: {
        chapter
      }
    })
  } catch (error) {
    console.error('❌ 创建章节失败:', error)
    res.status(500).json({
      status: 'error',
      message: '创建章节失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取小说的所有章节
export const getChaptersByNovel = async (req, res) => {
  try {
    const { novelId } = req.params
    const chapters = chapterStorage.findAll({ novelId })
    
    res.status(200).json({
      status: 'success',
      data: {
        chapters,
        total: chapters.length
      }
    })
  } catch (error) {
    console.error('❌ 获取章节列表失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取章节列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 获取章节详情
export const getChapterById = async (req, res) => {
  try {
    const chapter = chapterStorage.findById(req.params.id)
    
    if (!chapter) {
      return res.status(404).json({
        status: 'error',
        message: '章节不存在'
      })
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        chapter
      }
    })
  } catch (error) {
    console.error('❌ 获取章节详情失败:', error)
    res.status(500).json({
      status: 'error',
      message: '获取章节详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 更新章节
export const updateChapter = async (req, res) => {
  try {
    const chapterId = req.params.id
    
    const chapter = chapterStorage.update(chapterId, req.body)
    
    if (!chapter) {
      return res.status(404).json({
        status: 'error',
        message: '章节不存在'
      })
    }
    
    res.status(200).json({
      status: 'success',
      message: '章节更新成功',
      data: {
        chapter
      }
    })
  } catch (error) {
    console.error('❌ 更新章节失败:', error)
    res.status(500).json({
      status: 'error',
      message: '更新章节失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 删除章节
export const deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id
    
    const chapter = chapterStorage.findById(chapterId)
    if (!chapter) {
      return res.status(404).json({
        status: 'error',
        message: '章节不存在'
      })
    }
    
    chapterStorage.delete(chapterId)
    
    res.status(200).json({
      status: 'success',
      message: '章节删除成功'
    })
  } catch (error) {
    console.error('❌ 删除章节失败:', error)
    res.status(500).json({
      status: 'error',
      message: '删除章节失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}

// 更新章节顺序
export const updateChapterOrder = async (req, res) => {
  try {
    const { novelId } = req.params
    const { chapterIds } = req.body
    
    if (!Array.isArray(chapterIds)) {
      return res.status(400).json({
        status: 'error',
        message: '章节ID列表格式错误'
      })
    }
    
    chapterStorage.updateOrder(chapterIds)
    
    res.status(200).json({
      status: 'success',
      message: '章节顺序更新成功'
    })
  } catch (error) {
    console.error('❌ 更新章节顺序失败:', error)
    res.status(500).json({
      status: 'error',
      message: '更新章节顺序失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    })
  }
}


