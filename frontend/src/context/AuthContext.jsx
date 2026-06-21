// =============================================================================
// Netly Guardian — Authentication Context
// Manages JWT token, user state, login/register/logout
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // ── On mount: if token exists, verify it via /me ─────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const res = await api.get('/me')
        const userData = res.data

        // Restore name from localStorage if /me doesn't include it
        let userName
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}')
          userName = stored.name
        } catch { /* ignore */ }

        setUser({
          id: userData.user_id || userData.id,
          name: userData.name || userName || userData.email?.split('@')[0] || 'User',
          email: userData.email,
        })
        setToken(storedToken)
      } catch {
        // Token invalid or expired — clear everything
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // ── Login ────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await api.post('/login', { email, password })
    const { token: newToken, user: userData } = res.data

    localStorage.setItem('token', newToken)
    setToken(newToken)

    const userObj = {
      id: userData.id || userData.user_id,
      name: userData.name || email.split('@')[0],
      email: userData.email,
    }
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)

    return userObj
  }, [])

  // ── Register ─────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/register', { name, email, password })
    return res.data
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
