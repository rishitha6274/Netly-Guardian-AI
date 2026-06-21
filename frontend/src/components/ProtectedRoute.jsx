// =============================================================================
// Netly Guardian — Protected Route Guard
// Redirects unauthenticated users to landing page
// =============================================================================

import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // ── Loading state (checking /me on refresh) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-netly-bg-primary flex items-center justify-center">
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <p className="absolute mt-28 text-sm text-slate-500">Authenticating…</p>
      </div>
    )
  }

  // ── Not authenticated → redirect to landing ──
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // ── Authenticated → render child routes ──
  return <Outlet />
}
