import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// 导入路由
import postsRouter from './routes/posts'
import authRouter from './routes/auth'
import categoriesRouter from './routes/categories'
import commentsRouter from './routes/comments'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 路由
app.use('/api/posts', postsRouter)
app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/comments', commentsRouter)

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
