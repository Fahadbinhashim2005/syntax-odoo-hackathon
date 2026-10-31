import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { api, getStoredToken } from '../services/api'
import type { User } from '../types'
import { AuthContext } from './contextStore'
import type { TokenResponse } from '../types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()))

  const signOut = useCallback(() => {
    sessionStorage.removeItem('access_token')
    localStorage.removeItem('access_token')
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const response = await api.get<User>('/users/me')
    setUser(response.data)
  }, [])

  const signIn = useCallback((response: TokenResponse, remember: boolean) => {
    sessionStorage.removeItem('access_token')
    localStorage.removeItem('access_token')
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('access_token', response.access_token)
    setUser(response.user)
  }, [])

  useEffect(() => {
    const onExpired = () => signOut()
    window.addEventListener('auth:expired', onExpired)
    let timer: number | undefined
    if (getStoredToken()) {
      timer = window.setTimeout(() => {
        void refreshProfile()
          .catch(signOut)
          .finally(() => setLoading(false))
      }, 0)
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      window.removeEventListener('auth:expired', onExpired)
    }
  }, [refreshProfile, signOut])

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refreshProfile }),
    [user, loading, signIn, signOut, refreshProfile],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
