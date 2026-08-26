import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, clearToken, getToken, setToken } from './api'
import { queryKeys } from './queryKeys'
import type { User } from './types'

interface AuthContextValue {
  user: User | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => !!getToken())

  const { data: user, isLoading, isError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    enabled: hasToken,
    retry: false,
  })

  // A stale/expired token in localStorage: the request above 401s (api.ts's
  // interceptor already clears the token), but nothing yet tells this
  // provider to stop treating the visitor as "has a token, just loading" —
  // without this they'd be stuck mid-loading state forever on public pages.
  useEffect(() => {
    if (hasToken && isError) {
      setHasToken(false)
    }
  }, [hasToken, isError])

  function login(token: string) {
    setToken(token)
    setHasToken(true)
  }

  function logout() {
    clearToken()
    setHasToken(false)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: hasToken && isLoading,
        isAuthenticated: hasToken && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
