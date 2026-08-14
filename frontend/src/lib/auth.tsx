import { createContext, useContext, useState, type ReactNode } from 'react'
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

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    enabled: hasToken,
    retry: false,
  })

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
