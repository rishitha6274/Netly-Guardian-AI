import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Shield, Search, Bell, Network,
  LayoutDashboard, Monitor, ShieldAlert, Activity, BarChart3,
  LogOut, ChevronDown, User,
} from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/app': 'Dashboard',
  '/app/devices': 'Total Devices',
  '/app/devices/known': 'Known Devices',
  '/app/devices/unknown': 'Unknown Devices',
  '/app/devices/inventory': 'Device Inventory',
  '/app/devices/management': 'Device Management',
  '/app/devices/profiles': 'Device Profiles',
  '/app/devices/blocking': 'Device Blocking',
  '/app/devices/trust-center': 'Device Trust Center',
  '/app/security-score': 'Security Score',
  '/app/live-monitoring': 'Live Monitoring',
  '/app/network-activity-analytics': 'Network Activity Analytics',
  '/app/security-analytics': 'Security Analytics',
  '/app/events': 'Recent Events',
  '/app/events/joined': 'Device Joined',
  '/app/events/left': 'Device Left',
  '/app/notifications-center': 'Notifications Center',
  '/app/security-alerts': 'Security Alerts',
  '/app/auto-enforcement': 'Auto Enforcement',
  '/app/family-controls': 'Family Controls',
  '/app/reports': 'Reports',
  '/app/action-history': 'Action History',
  '/app/settings': 'Settings',
}

const LS_KEY = 'notificationsLastRead'

function getLastRead() {
  try { return localStorage.getItem(LS_KEY) || '' } catch { return '' }
}

function setLastRead(ts) {
  try { localStorage.setItem(LS_KEY, ts) } catch { /* noop */ }
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const pollingRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const currentTitle = pageTitles[location.pathname] || 'Netly Guardian'

  // User initials for avatar
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || '?'

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const isNotifPage = location.pathname === '/app/notifications-center'

  // Check for unread notifications
  const checkUnread = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setHasUnread(false)
        return
      }
      // Get the latest notification timestamp
      const latest = data.reduce((latest, n) => {
        const t = n.timestamp || ''
        return t > latest ? t : latest
      }, '')
      const lastRead = getLastRead()
      setHasUnread(!!latest && latest !== lastRead)
    } catch {
      // silent — dot is non-critical
    }
  }

  // Mark notifications as read when visiting the page
  const markRead = () => {
    fetch('/api/notifications').then(res => {
      if (!res.ok) return
      res.json().then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        const latest = data.reduce((latest, n) => {
          const t = n.timestamp || ''
          return t > latest ? t : latest
        }, '')
        if (latest) {
          setLastRead(latest)
          setHasUnread(false)
        }
      })
    }).catch(() => {})
  }

  // Poll every 30s + on mount
  useEffect(() => {
    checkUnread()
    pollingRef.current = setInterval(checkUnread, 30000)
    return () => clearInterval(pollingRef.current)
  }, [])

  // Mark read when navigating to the notifications page
  useEffect(() => {
    if (isNotifPage) markRead()
  }, [isNotifPage])

  const mobileLinks = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/devices', label: 'Devices', icon: Monitor },
    { path: '/app/security-score', label: 'Security Score', icon: Shield },
    { path: '/app/network-activity-analytics', label: 'Network Activity', icon: Network },
    { path: '/app/security-analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/app/live-monitoring', label: 'Live Monitor', icon: Activity },
    { path: '/app/security-alerts', label: 'Alerts', icon: ShieldAlert },
  ]

  return (
    <div className="min-h-screen bg-netly-bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-1 animate-float" />
        <div className="gradient-orb gradient-orb-2 animate-float" style={{ animationDelay: '-2s' }} />
        <div className="gradient-orb gradient-orb-3 animate-float" style={{ animationDelay: '-4s' }} />
      </div>
      <div className="noise-overlay" />

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-netly-bg-secondary z-50 lg:hidden border-r border-white/5"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-bold gradient-text">Netly</span>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="p-2 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="px-3 py-6 space-y-1.5">
                {mobileLinks.map(({ path, label, icon: Icon }) => (
                  <a
                    key={path}
                    href={path}
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileNavOpen(false)
                      window.history.pushState({}, '', path)
                      window.dispatchEvent(new Event('popstate'))
                    }}
                    className={`sidebar-item ${location.pathname === path ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 z-20 glass border-b border-white/5 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
        } left-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <motion.h1
              key={currentTitle}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white"
            >
              {currentTitle}
            </motion.h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className={`relative transition-all duration-300 hidden sm:block ${
                searchFocused ? 'w-72' : 'w-56'
              }`}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search IP, MAC, name..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-transparent focus:border-blue-500/50 focus:bg-white/10 transition-all outline-none text-sm text-white placeholder:text-slate-500"
              />
            </div>

            {/* Notifications → links to Notifications Center */}
            <button
              onClick={() => {
                setHasUnread(false) // optimistic clear
                navigate('/app/notifications-center')
              }}
              className={`relative p-2 rounded-xl transition-all ${
                isNotifPage
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              <Bell className={`w-5 h-5 ${isNotifPage ? 'text-blue-400' : ''}`} />
              {/* Red dot — only shows for unread notifications */}
              {hasUnread && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
                />
              )}
            </button>

            {/* User avatar with dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-semibold text-white text-sm">
                  {userInitials}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-netly-bg-secondary border border-white/10 shadow-2xl overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ''}</p>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main content */}
      <main
        className={`relative z-10 pt-20 pb-8 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
