import api from '@/services/api'

export const fetcher = (url: string) => {
  return api.get(url)
}
