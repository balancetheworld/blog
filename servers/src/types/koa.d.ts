declare module 'koa' {
  import { IncomingMessage, ServerResponse } from 'http'

  export type Request = IncomingMessage & {
    body?: any
    query?: any
    method?: string
    url?: string
  }

  export type Response = ServerResponse & {
    body?: any
    status?: number
  }

  export interface Context {
    request: Request
    response: Response
    body?: any
    query?: any
    params?: any
    state?: any
    status?: number
    method?: string
    url?: string
    app?: any
    cookies?: {
      get(name: string): string | undefined
      set(name: string, value: string, options?: any): void
    }
  }

  export interface Next {
    (err?: any): Promise<any>
  }

  export class Application {
    use(...middleware: any[]): this
    listen(port: number, callback?: () => void): any
    on(event: string, callback: (...args: any[]) => void): this
  }

  export class DefaultContext extends Context {}

  export class Koa<State = any, CustomContext = {}> extends Application {}
}

declare module 'koa-static' {
  const koaStatic: (root: string, opts?: any) => any
  export = koaStatic
}

declare module 'koa-bodyparser' {
  const bodyParser: (opts?: any) => any
  export = bodyParser
}

declare module '@koa/multer' {
  import { Context } from 'koa'
  interface Multer {
    single(name: string): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    array(name: string, maxCount?: number): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    fields(fields: { name: string; maxCount?: number }[]): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    none(): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
    any(): (ctx: Context, next: () => Promise<any>) => void | Promise<void>
  }
  const multer: (options?: any) => Multer
  export = multer
}

declare module 'koa' {
  interface Context {
    file?: any
    files?: any[]
  }
}

declare module 'koa-session' {
  import { Middleware } from 'koa'

  export interface Session {
    userId?: number
    username?: string
    isAdmin?: boolean
  }

  export interface Options {
    key?: string
    maxAge?: number
    autoCommit?: boolean
    signed?: boolean
  }

  export default function session(opts?: Options, app?: any): Middleware
}
