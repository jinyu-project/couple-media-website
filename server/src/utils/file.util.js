import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取文件URL路径
export const getFileUrl = (filePath) => {
  const relativePath = path.relative(path.join(__dirname, '../../uploads'), filePath)
  return `/api/files/preview/${relativePath.replace(/\\/g, '/')}`
}

// 删除文件
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    } else {
      resolve() // 文件不存在也算成功
    }
  })
}

