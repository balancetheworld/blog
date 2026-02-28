declare module '@koa/cors' {
  import { Middleware } from 'koa'

  interface CorsOptions {
    origin: string | string[] | ((ctx: any) => string)
    credentials?: boolean
    allowMethods?: string[]
    allowHeaders?: string[]
    exposeHeaders?: string[]
    maxAge?: number
  }

  export default function cors(options?: CorsOptions): Middleware
}
