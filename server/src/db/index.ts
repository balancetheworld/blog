import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// 创建数据库连接
const sqlite = new Database(process.env.DATABASE_URL || './blog.db')

// 启用外键约束
sqlite.pragma('foreign_keys = ON')

// 导出数据库实例
export const db = drizzle(sqlite, { schema })

// 导出 schema 供查询使用
export * from './schema'
