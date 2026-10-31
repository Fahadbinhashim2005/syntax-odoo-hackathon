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
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export interface FinanceDashboard {
  total_revenue: string
  total_outstanding: string
  total_invoices: number
  paid_invoices: number
  overdue_invoice_count: number
  overdue_amount: string
}

export function getFinanceDashboard(): Promise<FinanceDashboard> {
  return request<FinanceDashboard>('/api/dashboard/finance')
}

export interface Invoice {
  id: number
  invoice_number: string
  customer_id: number
  issue_date: string
  due_date: string
  subtotal: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  paid_amount: string
  outstanding_amount: string
  status: string
}

export function getInvoices(): Promise<Invoice[]> {
  return request<Invoice[]>('/api/invoices')
}

export interface Payment {
  id: number
  invoice_id: number
  amount: string
  payment_method: string
  transaction_reference: string | null
  payment_date: string
  status: string
}

export interface PaymentCreate {
  invoice_id: number
  amount: number
  payment_method: string
  transaction_reference?: string | null
}

async function writeRequest<T>(path: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const payload = await response.json()
      message = typeof payload.detail === 'string' ? payload.detail : message
    } catch {
      // Keep the HTTP status message when the server doesn't return JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function getPayments(): Promise<Payment[]> {
  return request<Payment[]>('/api/payments')
}

export function getInvoicePayments(invoiceId: number): Promise<Payment[]> {
  return request<Payment[]>(`/api/payments/invoice/${invoiceId}`)
}

export function createPayment(data: PaymentCreate): Promise<Payment> {
  return writeRequest<Payment>('/api/payments', 'POST', data)
}
