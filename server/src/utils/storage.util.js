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

