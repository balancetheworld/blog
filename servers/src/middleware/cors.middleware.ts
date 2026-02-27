import cors from '@koa/cors'
import { config } from '../config'

export const corsMiddleware = cors({
  origin: config.corsOrigin,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})
