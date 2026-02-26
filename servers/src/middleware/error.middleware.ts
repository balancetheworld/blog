import type { Context, Next } from 'koa'

export interface ApiError {
  success: false
  error: string
  message?: string
}

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (error) {
    console.error('Error caught by error handler:', error)

    const status = (error as { status?: number }).status || 500
    const message = (error as { message?: string }).message || 'Internal server error'

    ctx.status = status
    ctx.body = {
      success: false,
      error: message,
    } as ApiError

    // Emit error for logging
    ctx.app.emit('error', error, ctx)
  }
}
