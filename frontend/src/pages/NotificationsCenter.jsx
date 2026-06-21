import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellRing, BellOff, Search, Clock, AlertTriangle,
  Info, ShieldAlert, Wifi, Download, Upload, Settings,
  Shield, Activity, AlertCircle, CheckCircle, X,
  ChevronDown, ArrowUpDown, SlidersHorizontal, Trash2,
  Radio, Monitor, ExternalLink,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const severityConfig = {
  high: {
    color: 'red',
    hex: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    text: 'text-red-400',
    textBg: 'text-red-300',
    badgeBg: 'bg-red-500/15',
    badgeBorder: 'border-red-500/30',
    glow: 'rgba(239,68,68,0.15)',
    label: 'High',
    icon: ShieldAlert,
  },
  medium: {
    color: 'orange',
    hex: '#f97316',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    text: 'text-orange-400',
    textBg: 'text-orange-300',
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/30',
    glow: 'rgba(249,115,22,0.1)',
    label: 'Medium',
    icon: AlertCircle,
  },
  low: {
    color: 'blue',
    hex: '#3b82f6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    text: 'text-blue-400',
    textBg: 'text-blue-300',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/30',
    glow: 'rgba(59,130,246,0.08)',
    label: 'Low',
    icon: Bell,
  },
}

const getSeverity = (s) => severityConfig[s] || severityConfig.low

const getTitleIcon = (title) => {
  const t = (title || '').toLowerCase()
  if (t.includes('unknown') || t.includes('intrusion') || t.includes('attack')) return ShieldAlert
  if (t.includes('firewall') || t.includes('security')) return Shield
  if (t.includes('device') || t.includes('offline') || t.includes('curfew')) return Monitor
  if (t.includes('network') || t.includes('wifi') || t.includes('channel')) return Wifi
  if (t.includes('backup') || t.includes('firmware') || t.includes('update')) return Download
  if (t.includes('certificate') || t.includes('dns')) return Settings
  if (t.includes('guest')) return Radio
  if (t.includes('performance') || t.includes('latency')) return Activity
  return Bell
}

const timeAgo = (ts) => {
  if (!ts) return ''
  const d = new Date(ts.replace(' ', 'T'))
  const now = new Date()
  const s = Math.floor((now - d) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatTimestamp = (ts) => {
  if (!ts) return ''
  const d = new Date(ts.replace(' ', 'T'))
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month} ${day} · ${hour}:${min}`
}

/* =========================================================================
   Particle Field Background
   ========================================================================= */

function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'][i % 4],
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0, 2, 0],
            y: [0, -20 - Math.random() * 20],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* =========================================================================
   Stat Card
   ========================================================================= */

function StatCard({ label, value, icon: Icon, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/5 p-4"
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white tabular-nums mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Notification Card
   ========================================================================= */

function NotificationCard({ notification, idx }) {
  const sev = getSeverity(notification.severity)
  const Icon = getTitleIcon(notification.title)
  const isHigh = notification.severity === 'high'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
      whileHover={{ x: 3 }}
      className={`relative group rounded-2xl overflow-hidden transition-shadow duration-300 ${
        isHigh ? 'shadow-lg' : ''
      }`}
      style={isHigh ? { boxShadow: `0 0 30px -8px ${sev.hex}30` } : {}}
    >
      {/* Left severity bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: sev.hex }}
      />

      {/* High severity glow overlay */}
      {isHigh && (
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${sev.hex} 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Scan line on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="scan-line" />
      </div>

      <div
        className={`relative z-10 p-4 sm:p-5 border ${
          isHigh
            ? 'border-red-500/20 bg-gradient-to-r from-red-500/[0.06] via-red-500/[0.02] to-transparent'
            : 'border-white/5 bg-netly-bg-secondary'
        } rounded-2xl`}
      >
        <div className="flex items-start gap-4">
          {/* Severity icon */}
          <div
            className={`relative flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${
              sev.border} ${sev.bg
            }`}
          >
            <Icon className={`w-5 h-5 ${sev.text}`} />
            {isHigh && (
              <span className="absolute -top-0.5 -right-0.5 flex w-3 h-3">
                <span
                  className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                  style={{ backgroundColor: sev.hex }}
                />
                <span
                  className="relative inline-flex w-3 h-3 rounded-full"
                  style={{ backgroundColor: sev.hex }}
                />
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3
                  className={`text-sm font-semibold ${
                    isHigh ? 'text-white' : 'text-slate-200'
                  } truncate`}
                >
                  {notification.title || 'Notification'}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Severity badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sev.badgeBg} ${sev.badgeBorder} ${sev.textBg}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sev.hex }}
                  />
                  {sev.label}
                </span>
              </div>
            </div>

            {/* Message */}
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {notification.message || ''}
            </p>

            {/* Timestamp */}
            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-600">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(notification.timestamp)}</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-500">{timeAgo(notification.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Notifications Center Page
   ========================================================================= */

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length
    const high = notifications.filter(n => n.severity === 'high').length
    const medium = notifications.filter(n => n.severity === 'medium').length
    const low = notifications.filter(n => n.severity === 'low').length
    return { total, high, medium, low }
  }, [notifications])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...notifications]

    if (severityFilter !== 'all') {
      result = result.filter(n => n.severity === severityFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.message || '').toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp.replace(' ', 'T')).getTime() : 0
      const tb = b.timestamp ? new Date(b.timestamp.replace(' ', 'T')).getTime() : 0
      return sortOrder === 'newest' ? tb - ta : ta - tb
    })

    return result
  }, [notifications, severityFilter, search, sortOrder])

  // ── Loading ──
  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-12 w-72 skeleton rounded-lg" />
        <div className="h-4 w-96 skeleton rounded" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4 space-y-2">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="h-8 w-12 skeleton rounded" />
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="h-12 skeleton rounded-xl" />

        {/* Notification cards */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 skeleton rounded" />
                  <div className="h-3 w-full skeleton rounded" />
                  <div className="h-3 w-3/4 skeleton rounded" />
                  <div className="h-3 w-28 skeleton rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <BellOff className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load notifications</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Cinematic Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950/60 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        <ParticleField />

        {/* Glow orbs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top scan line */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />
        <div className="absolute bottom-0 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/25">
                  <BellRing className="w-5 h-5 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Notifications Center</h1>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                  {stats.total}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 ml-1">
                Real-time security alerts, system events, and network notifications
              </p>
            </div>

            <button
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
            >
              <Clock className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatCard label="Total" value={stats.total} icon={Bell} color="text-blue-400" bg="bg-blue-500/10" delay={0.05} />
            <StatCard
              label="High"
              value={stats.high}
              icon={ShieldAlert}
              color="text-red-400"
              bg="bg-red-500/10"
              delay={0.1}
            />
            <StatCard
              label="Medium"
              value={stats.medium}
              icon={AlertCircle}
              color="text-orange-400"
              bg="bg-orange-500/10"
              delay={0.15}
            />
            <StatCard
              label="Low"
              value={stats.low}
              icon={Bell}
              color="text-blue-400"
              bg="bg-blue-500/10"
              delay={0.2}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </div>

        {/* Severity pills */}
        <div className="flex items-center gap-1.5">
          {[
            { value: 'all', label: 'All', color: 'text-blue-400', activeBg: 'bg-blue-500/15', activeBorder: 'border-blue-500/30' },
            { value: 'high', label: 'High', color: 'text-red-400', activeBg: 'bg-red-500/15', activeBorder: 'border-red-500/30' },
            { value: 'medium', label: 'Medium', color: 'text-orange-400', activeBg: 'bg-orange-500/15', activeBorder: 'border-orange-500/30' },
            { value: 'low', label: 'Low', color: 'text-blue-400', activeBg: 'bg-blue-500/15', activeBorder: 'border-blue-500/30' },
          ].map(s => {
            const isActive = severityFilter === s.value
            const count = s.value === 'all' ? stats.total : stats[s.value]
            return (
              <button
                key={s.value}
                onClick={() => setSeverityFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? `${s.activeBg} ${s.color} ${s.activeBorder}`
                    : 'bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
                }`}
              >
                {s.label}
                <span className={`ml-1.5 text-[10px] ${isActive ? '' : 'text-slate-600'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 outline-none focus:border-blue-500/50 cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Result count */}
        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} of {notifications.length} notifications
        </span>
      </motion.div>

      {/* ── Notification List ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/50 border border-white/5 mb-5">
              {search ? (
                <BellOff className="w-10 h-10 text-slate-600" />
              ) : (
                <CheckCircle className="w-10 h-10 text-emerald-500/60" />
              )}
            </div>
            <p className="text-base font-semibold text-slate-400">
              {search ? 'No matching notifications' : 'All clear'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {search
                ? 'Try adjusting your search or filters'
                : 'No notifications match the current filter'}
            </p>
            {(search || severityFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setSeverityFilter('all') }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((notification, idx) => (
                <NotificationCard
                  key={`${notification.timestamp}-${notification.title}-${idx}`}
                  notification={notification}
                  idx={idx}
                />
              ))}
            </AnimatePresence>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-4 pb-2"
            >
              <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
                <Bell className="w-3 h-3" />
                Showing {filtered.length} of {notifications.length} notifications
                · Updated in real-time
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
