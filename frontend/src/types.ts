export type UserRole = 'admin' | 'staff' | 'customer' | 'developer_team'

export interface User {
  id: number
  full_name: string
  email: string
  phone: string
  company_name: string | null
  address: string | null
  role: UserRole
  is_active: boolean
  must_change_password: boolean
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface DashboardStats {
  role: UserRole
  customers?: number
  staff?: number
}
