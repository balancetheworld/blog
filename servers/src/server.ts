import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { router } from './routes'
import { errorHandler } from './middleware/error.middleware'
import { logger } from './middleware/logger.middleware'
import { corsMiddleware } from './middleware/cors.middleware'
import { config } from './config'
import { getDatabase } from './database/connection'

const app = new Koa()

// Initialize database
console.log('Initializing database...')
getDatabase()
console.log('Database initialized.')

// Error handler (must be first)
app.use(errorHandler)

// Logger
app.use(logger)

// CORS
app.use(corsMiddleware)

// Body parser
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb',
}))

// Routes
app.use(router.routes())
app.use(router.allowedMethods())

// Error event listener
app.on('error', (err, ctx) => {
  console.error('Server error:', err)
})

// Start server
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
  console.log(`Environment: ${config.nodeEnv}`)
  console.log(`CORS origin: ${config.corsOrigin}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...')
  process.exit(0)
})
