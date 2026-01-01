import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// 导入路由
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import fileRoutes from './routes/file.routes.js'
import albumRoutes from './routes/album.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件配置
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/couple-media'

// 设置MongoDB连接选项
const mongooseOptions = {
  // 连接失败时不抛出错误，让应用继续运行
  // 这样即使MongoDB未启动，API也能返回空数据而不是500错误
}

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB 连接成功')
  })
  .catch((error) => {
    console.error('❌ MongoDB 连接失败:', error.message)
    console.log('⚠️  注意：应用将继续运行，但文件数据将无法保存')
    console.log('💡 提示：请确保MongoDB服务已启动，或使用MongoDB Atlas云数据库')
  })

// 路由配置
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/albums', albumRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: '接口不存在' 
  })
})

// 错误处理中间件（必须在所有路由之后）
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err.message)
  console.error('错误堆栈:', err.stack)
  res.status(500).json({ 
    status: 'error', 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
})

