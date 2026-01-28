// 在服务器端使用绝对 URL，客户端使用相对 URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 客户端：使用相对路径，通过 Next.js rewrites
    return ''
  }
  // 服务器端：直接使用后端 URL
  return process.env.BACKEND_URL || 'http://localhost:3001'
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const API_BASE_URL = getBaseUrl()
  const url = `${API_BASE_URL}${endpoint}`

  // Debug logging
  console.log('[API] Fetching:', url, '(server-side:', typeof window === 'undefined', ')')

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  console.log('[API] Response status:', response.status, 'OK:', response.ok)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[API] Error response:', errorText)
    throw new Error(errorText || 'API request failed')
  }

  const data = await response.json()
  console.log('[API] Response data:', Array.isArray(data) ? `${data.length} items` : 'data received')
  return data
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => fetchAPI<T>(endpoint, options),
  post: <T>(endpoint: string, data: any, options?: RequestInit) => fetchAPI<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: <T>(endpoint: string, data: any, options?: RequestInit) => fetchAPI<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: <T>(endpoint: string, options?: RequestInit) => fetchAPI<T>(endpoint, {
    ...options,
    method: 'DELETE',
  }),
}
