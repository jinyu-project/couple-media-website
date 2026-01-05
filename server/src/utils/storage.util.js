import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据存储目录
const DATA_DIR = path.join(__dirname, '../../data')
const FILES_DB = path.join(DATA_DIR, 'files.json')
const ALBUMS_DB = path.join(DATA_DIR, 'albums.json')
const USERS_DB = path.join(DATA_DIR, 'users.json')
const NOVELS_DB = path.join(DATA_DIR, 'novels.json')
const CHAPTERS_DB = path.join(DATA_DIR, 'chapters.json')

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 初始化空数据库文件
const initDbFile = (filePath, defaultValue = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8')
  }
}

// 初始化所有数据库文件
initDbFile(FILES_DB, [])
initDbFile(ALBUMS_DB, [])
initDbFile(USERS_DB, [])
initDbFile(NOVELS_DB, [])
initDbFile(CHAPTERS_DB, [])

// 读取数据
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`读取数据失败 ${filePath}:`, error)
    return []
  }
}

// 写入数据
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`写入数据失败 ${filePath}:`, error)
    return false
  }
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 规范化文件对象，添加 _id 字段以兼容前端
const normalizeFile = (file) => {
  if (!file) return null
  return {
    ...file,
    _id: file.id || file._id
  }
}

// 规范化文件数组
const normalizeFiles = (files) => {
  return files.map(normalizeFile)
}

// 文件存储操作
export const fileStorage = {
  // 获取所有文件
  findAll: (query = {}) => {
    const files = readData(FILES_DB)
    
    // 简单查询过滤
    let filtered = files
    if (query.type) {
      filtered = filtered.filter(f => f.type === query.type)
    }
    if (query.isFavorite === 'true') {
      filtered = filtered.filter(f => f.isFavorite === true)
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase()
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchLower) ||
        f.originalName.toLowerCase().includes(searchLower) ||
        (f.description && f.description.toLowerCase().includes(searchLower))
      )
    }
    
    return normalizeFiles(filtered)
  },

  // 根据ID查找文件（支持 id 或 _id）
  findById: (id) => {
    if (!id) return null
    const files = readData(FILES_DB)
    const file = files.find(f => {
      // 支持 id、_id 字段匹配
      return f.id === id || f._id === id || (f.id && f.id.toString() === id.toString()) || (f._id && f._id.toString() === id.toString())
    })
    return normalizeFile(file)
  },

  // 创建文件
  create: (fileData) => {
    const files = readData(FILES_DB)
    const newFile = {
      id: generateId(),
      ...fileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    files.push(newFile)
    writeData(FILES_DB, files)
    return normalizeFile(newFile)
  },

  // 更新文件（支持 id 或 _id）
  update: (id, updateData) => {
    if (!id) return null
    const files = readData(FILES_DB)
    const index = files.findIndex(f => {
      return f.id === id || f._id === id || (f.id && f.id.toString() === id.toString()) || (f._id && f._id.toString() === id.toString())
    })
    if (index === -1) return null
    
    files[index] = {
      ...files[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    writeData(FILES_DB, files)
    return normalizeFile(files[index])
  },

  // 删除文件（支持 id 或 _id）
  delete: (id) => {
    if (!id) return false
    const files = readData(FILES_DB)
    const index = files.findIndex(f => {
      return f.id === id || f._id === id || (f.id && f.id.toString() === id.toString()) || (f._id && f._id.toString() === id.toString())
    })
    if (index === -1) return false
    
    files.splice(index, 1)
    writeData(FILES_DB, files)
    return true
  },

  // 统计数量
  count: (query = {}) => {
    return fileStorage.findAll(query).length
  }
}

// 相册存储操作
export const albumStorage = {
  findAll: () => {
    return readData(ALBUMS_DB)
  },

  findById: (id) => {
    const albums = readData(ALBUMS_DB)
    return albums.find(a => a.id === id)
  },

  create: (albumData) => {
    const albums = readData(ALBUMS_DB)
    const newAlbum = {
      id: generateId(),
      ...albumData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    albums.push(newAlbum)
    writeData(ALBUMS_DB, albums)
    return newAlbum
  },

  update: (id, updateData) => {
    const albums = readData(ALBUMS_DB)
    const index = albums.findIndex(a => a.id === id)
    if (index === -1) return null
    
    albums[index] = {
      ...albums[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    writeData(ALBUMS_DB, albums)
    return albums[index]
  },

  delete: (id) => {
    const albums = readData(ALBUMS_DB)
    const index = albums.findIndex(a => a.id === id)
    if (index === -1) return false
    
    albums.splice(index, 1)
    writeData(ALBUMS_DB, albums)
    return true
  }
}

// 用户存储操作
export const userStorage = {
  findAll: () => {
    return readData(USERS_DB)
  },

  findById: (id) => {
    const users = readData(USERS_DB)
    return users.find(u => u.id === id)
  },

  create: (userData) => {
    const users = readData(USERS_DB)
    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    users.push(newUser)
    writeData(USERS_DB, users)
    return newUser
  }
}

// 小说存储操作
export const novelStorage = {
  findAll: () => {
    return readData(NOVELS_DB)
  },

  findById: (id) => {
    const novels = readData(NOVELS_DB)
    return novels.find(n => n.id === id)
  },

  create: (novelData) => {
    const novels = readData(NOVELS_DB)
    const newNovel = {
      id: generateId(),
      ...novelData,
      chapterCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    novels.push(newNovel)
    writeData(NOVELS_DB, novels)
    return newNovel
  },

  update: (id, updateData) => {
    const novels = readData(NOVELS_DB)
    const index = novels.findIndex(n => n.id === id)
    if (index === -1) return null
    
    novels[index] = {
      ...novels[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    writeData(NOVELS_DB, novels)
    return novels[index]
  },

  delete: (id) => {
    const novels = readData(NOVELS_DB)
    const index = novels.findIndex(n => n.id === id)
    if (index === -1) return false
    
    novels.splice(index, 1)
    writeData(NOVELS_DB, novels)
    return true
  },

  updateChapterCount: (id) => {
    const novels = readData(NOVELS_DB)
    const novel = novels.find(n => n.id === id)
    if (!novel) return null
    
    const chapters = readData(CHAPTERS_DB)
    const chapterCount = chapters.filter(c => c.novelId === id).length
    novel.chapterCount = chapterCount
    novel.updatedAt = new Date().toISOString()
    writeData(NOVELS_DB, novels)
    return novel
  }
}

// 章节存储操作
export const chapterStorage = {
  findAll: (query = {}) => {
    const chapters = readData(CHAPTERS_DB)
    let filtered = chapters
    
    if (query.novelId) {
      filtered = filtered.filter(c => c.novelId === query.novelId)
    }
    
    // 按 order 排序，如果没有 order 则按创建时间排序
    filtered.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      if (a.order !== undefined) return -1
      if (b.order !== undefined) return 1
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
    
    return filtered
  },

  findById: (id) => {
    const chapters = readData(CHAPTERS_DB)
    return chapters.find(c => c.id === id)
  },

  create: (chapterData) => {
    const chapters = readData(CHAPTERS_DB)
    
    // 如果没有指定 order，自动设置为最大 order + 1
    if (chapterData.order === undefined) {
      const novelChapters = chapters.filter(c => c.novelId === chapterData.novelId)
      const maxOrder = novelChapters.length > 0 
        ? Math.max(...novelChapters.map(c => c.order || 0))
        : -1
      chapterData.order = maxOrder + 1
    }
    
    const newChapter = {
      id: generateId(),
      ...chapterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    chapters.push(newChapter)
    writeData(CHAPTERS_DB, chapters)
    
    // 更新小说的章节数
    novelStorage.updateChapterCount(chapterData.novelId)
    
    return newChapter
  },

  update: (id, updateData) => {
    const chapters = readData(CHAPTERS_DB)
    const index = chapters.findIndex(c => c.id === id)
    if (index === -1) return null
    
    chapters[index] = {
      ...chapters[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    writeData(CHAPTERS_DB, chapters)
    
    // 如果更新了 novelId，需要更新两个小说的章节数
    if (updateData.novelId && chapters[index].novelId !== updateData.novelId) {
      novelStorage.updateChapterCount(chapters[index].novelId)
      novelStorage.updateChapterCount(updateData.novelId)
    }
    
    return chapters[index]
  },

  delete: (id) => {
    const chapters = readData(CHAPTERS_DB)
    const index = chapters.findIndex(c => c.id === id)
    if (index === -1) return false
    
    const novelId = chapters[index].novelId
    chapters.splice(index, 1)
    writeData(CHAPTERS_DB, chapters)
    
    // 更新小说的章节数
    novelStorage.updateChapterCount(novelId)
    
    return true
  },

  updateOrder: (chapterIds) => {
    const chapters = readData(CHAPTERS_DB)
    chapterIds.forEach((chapterId, index) => {
      const chapter = chapters.find(c => c.id === chapterId)
      if (chapter) {
        chapter.order = index
        chapter.updatedAt = new Date().toISOString()
      }
    })
    writeData(CHAPTERS_DB, chapters)
    return true
  }
}

