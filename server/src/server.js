import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// 导入路由
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import fileRoutes from './routes/file.routes.js'
import albumRoutes from './routes/album.routes.js'
import novelRoutes from './routes/novel.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// 中间件配置
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// 路由配置
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/albums', albumRoutes)
app.use('/api/novels', novelRoutes)

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

