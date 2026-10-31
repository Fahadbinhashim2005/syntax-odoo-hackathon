import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

export function getStoredToken() {
  return sessionStorage.getItem('access_token') || localStorage.getItem('access_token')
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      sessionStorage.removeItem('access_token')
      localStorage.removeItem('access_token')
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).filter(Boolean).join(' ')
    }
    if (!error.response) return 'Cannot reach the server. Check that the backend is running.'
  }
  return 'Something went wrong. Please try again.'
}
