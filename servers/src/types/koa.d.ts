declare module 'koa' {
  interface Context {
    request: {
      body: any
      query: any
    }
    response: {
      body: any
    }
    body: any
    query: any
    params: any
    state: any
    cookies: {
      get(name: string): string | undefined
      set(name: string, value: string, options?: any): void
    }
  }
}
