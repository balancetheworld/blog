declare module '@koa/multer' {
  import { Context } from 'koa'

  interface File {
    filename: string
    originalname: string
    path: string
    size: number
    mimetype: string
  }

  interface MulterOptions {
    dest?: string
    limits?: {
      fieldNameSize?: number
      fieldSize?: number
      fields?: number
      fileSize?: number
      files?: number
    }
  }

  interface Multer {
    single(name: string): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    array(name: string, maxCount?: number): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    fields(fields: { name: string; maxCount?: number }[]): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    none(): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    any(): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
  }

  const multer: (options?: MulterOptions) => Multer

  export = multer
}

declare module 'koa' {
  interface Context {
    file?: any
    files?: any[]
  }
}
