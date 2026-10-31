import { createContext } from 'react'
import type { TokenResponse, User } from '../types'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (response: TokenResponse, remember: boolean) => void
  signOut: () => void
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
