export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: process.env.DATABASE_PATH || './database/blog.db',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
}
