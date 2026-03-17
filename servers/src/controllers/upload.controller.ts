import type { Context } from 'koa'
import multer from '@koa/multer'
import path from 'path'
import fs from 'fs'

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 创建 multer 实例
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// 单文件上传中间件
const uploadSingle = upload.single('file')

export const uploadController = {
  /**
   * 上传图片
   * POST /api/upload/image
   * 需要认证
   */
  uploadImage: async (ctx: Context) => {
    try {
      // 使用 middleware 处理文件上传
      await new Promise((resolve, reject) => {
        uploadSingle(ctx, () => {
          resolve(void 0)
        })
      })

      const file = ctx.file as any

      if (!file) {
        ctx.status = 400
        ctx.body = {
          success: false,
          error: '没有上传文件',
        }
        return
      }

      // 返回图片 URL
      const imageUrl = `/uploads/images/${file.filename}`

      ctx.body = {
        success: true,
        data: {
          url: imageUrl,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
        },
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message || '上传失败',
      }
    }
  },
}

export type UploadControllerType = typeof uploadController
