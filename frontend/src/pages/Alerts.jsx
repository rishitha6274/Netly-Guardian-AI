import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, AlertTriangle, AlertCircle, Moon, Clock,
  Search, Shield, ShieldCheck, Activity, Zap,
  Monitor, Wifi, WifiOff, Eye,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const severityConfig = {
  high:    { hex: '#ef4444', bg: 'bg-red-500/15', text: 'text-red-400', label: 'High', border: 'border-red-500/30', dot: 'bg-red-400' },
  medium:  { hex: '#f97316', bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Medium', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  low:     { hex: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Low', border: 'border-blue-500/30', dot: 'bg-blue-400' },
}

const getSeverity = (s) => severityConfig[s] || severityConfig.low

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

/* =========================================================================
   Severity Badge
   ========================================================================= */

function SeverityBadge({ severity }) {
  const s = getSeverity(severity)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

/* =========================================================================
   Stat Card
   ========================================================================= */

function StatCard({ label, value, icon: Icon, color, bg, delay, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/5 p-4"
    >
      {accent && (
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.06] blur-2xl pointer-events-none" style={{ backgroundColor: accent }} />
      )}
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
   Alert Card Components
   ========================================================================= */

function SecurityAlertCard({ alert, idx }) {
  const sev = getSeverity(alert.severity || 'high')
  const isHigh = alert.severity === 'high'
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`relative rounded-xl border ${sev.border} bg-gradient-to-r from-${isHigh ? 'red' : 'orange'}-500/[0.06] via-${isHigh ? 'red' : 'orange'}-500/[0.02] to-transparent p-3.5`}
    >
      <div className={`absolute -top-6 -right-6 w-16 h-16 ${sev.bg} rounded-full blur-2xl pointer-events-none`} />
      <div className="relative z-10 flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${sev.bg} border ${sev.border} flex-shrink-0`}>
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white truncate capitalize">
              {alert.type?.replace(/_/g, ' ') || 'Security Alert'}
            </p>
            <SeverityBadge severity={alert.severity || 'high'} />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{alert.message || ''}</p>
          {alert.mac && (
            <p className="text-[10px] font-mono text-slate-600 mt-0.5">{alert.mac}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ScreenTimeCard({ alert, idx }) {
  const pct = alert.limit > 0 ? Math.min((alert.usage / alert.limit) * 100, 100) : 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="relative rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/[0.06] via-red-500/[0.02] to-transparent p-3.5"
    >
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white truncate">{alert.name || 'Unknown'}</p>
            <SeverityBadge severity="high" />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{alert.owner ? `Owner: ${alert.owner}` : ''}</p>
          <p className="text-[11px] text-red-200/70 mt-1">{alert.message || ''}</p>
          {alert.limit > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-500">Usage</span>
                <span className="text-red-300 font-mono">{alert.usage} / {alert.limit} min</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.04 }}
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CurfewCard({ alert, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="relative rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.06] via-indigo-500/[0.02] to-transparent p-3.5"
    >
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0">
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white truncate">{alert.device || alert.name || 'Unknown'}</p>
            <SeverityBadge severity="medium" />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{alert.owner ? `Owner: ${alert.owner}` : ''}</p>
          <p className="text-[11px] text-indigo-200/70 mt-1">{alert.message || ''}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Section Panel
   ========================================================================= */

const TAB_ICONS = {
  security: ShieldAlert,
  screen: Monitor,
  curfew: Moon,
}

function AlertSection({ type, title, alerts, icon: Icon, accent, emptyIcon: EmptyIcon, emptyTitle, emptySub }) {
  const [open, setOpen] = useState(true)
  const isEmpty = alerts.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
    >
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${accent}-500/10`}>
            <Icon className={`w-4 h-4 text-${accent}-400`} />
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {!isEmpty && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-${accent}-500/15 text-${accent}-300 border border-${accent}-500/25`}>
              {alerts.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <span className="text-[10px] text-slate-500">{alerts.length} active</span>
          )}
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <Activity className="w-4 h-4 text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Collapsible content */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {open && (
          <div className="p-4">
            {isEmpty ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-3">
                  <EmptyIcon className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-400">{emptyTitle}</p>
                <p className="text-xs text-slate-600 mt-1">{emptySub}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {alerts.map((alert, i) => {
                  if (type === 'security') return <SecurityAlertCard key={i} alert={alert} idx={i} />
                  if (type === 'screen') return <ScreenTimeCard key={i} alert={alert} idx={i} />
                  if (type === 'curfew') return <CurfewCard key={i} alert={alert} idx={i} />
                  return null
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* =========================================================================
   Alerts Page
   ========================================================================= */

export default function Alerts() {
  const [securityAlerts, setSecurityAlerts] = useState([])
  const [screenTimeAlerts, setScreenTimeAlerts] = useState([])
  const [curfewAlerts, setCurfewAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const [securityRes, alertsRes, curfewRes] = await Promise.all([
        fetch('/api/security-alerts'),
        fetch('/api/alerts'),
        fetch('/api/curfew-alerts'),
      ])
      if (!securityRes.ok) throw new Error(`Security alerts failed (${securityRes.status})`)
      if (!alertsRes.ok) throw new Error(`Alerts failed (${alertsRes.status})`)
      if (!curfewRes.ok) throw new Error(`Curfew alerts failed (${curfewRes.status})`)

      const security = await securityRes.json()
      const alerts = await alertsRes.json()
      const curfew = await curfewRes.json()

      setSecurityAlerts(Array.isArray(security) ? security : [])
      setScreenTimeAlerts(Array.isArray(alerts) ? alerts : [])
      setCurfewAlerts(Array.isArray(curfew) ? curfew : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  // Stats
  const stats = useMemo(() => ({
    total: securityAlerts.length + screenTimeAlerts.length + curfewAlerts.length,
    security: securityAlerts.length,
    screenTime: screenTimeAlerts.length,
    curfew: curfewAlerts.length,
  }), [securityAlerts, screenTimeAlerts, curfewAlerts])

  // Filtered by search
  const filterBySearch = (arr, fields) => {
    if (!search.trim()) return arr
    const q = search.toLowerCase()
    return arr.filter(item =>
      fields.some(f => String(item[f] || '').toLowerCase().includes(q))
    )
  }

  const filteredSecurity = useMemo(() => filterBySearch(securityAlerts, ['message', 'type', 'mac']), [securityAlerts, search])
  const filteredScreen = useMemo(() => filterBySearch(screenTimeAlerts, ['name', 'owner', 'message']), [screenTimeAlerts, search])
  const filteredCurfew = useMemo(() => filterBySearch(curfewAlerts, ['device', 'owner', 'message']), [curfewAlerts, search])

  // Loading skeleton
  if (loading && stats.total === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 skeleton rounded-lg" />
        <div className="h-4 w-72 skeleton rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4 space-y-2">
              <div className="h-3 w-20 skeleton rounded" /><div className="h-8 w-12 skeleton rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-3">
              <div className="h-4 w-36 skeleton rounded" />
              {[1,2].map(j => <div key={j} className="h-16 skeleton rounded-xl" />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <ShieldAlert className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load alerts</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button onClick={fetchAlerts}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >Retry</button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Cinematic Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950/60 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-red-400/20 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/25">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                Live
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 ml-1">
              Real-time security alerts, screen time violations, and curfew enforcement across your network
            </p>
          </div>
          <button onClick={fetchAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
          >
            <Clock className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatCard label="Total Alerts" value={stats.total} icon={ShieldAlert} color="text-red-400" bg="bg-red-500/10" delay={0.05} accent="#ef4444" />
          <StatCard label="Security" value={stats.security} icon={Shield} color="text-orange-400" bg="bg-orange-500/10" delay={0.1} accent="#f97316" />
          <StatCard label="Screen Time" value={stats.screenTime} icon={Monitor} color="text-amber-400" bg="bg-amber-500/10" delay={0.15} accent="#f59e0b" />
          <StatCard label="Curfew" value={stats.curfew} icon={Moon} color="text-indigo-400" bg="bg-indigo-500/10" delay={0.2} accent="#818cf8" />
        </div>
      </motion.div>

      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </motion.div>

      {/* ── Alert Sections ── */}
      <div className="space-y-4">
        <AlertSection
          type="security"
          title="Security Alerts"
          icon={ShieldAlert}
          accent="red"
          alerts={filteredSecurity}
          emptyIcon={ShieldCheck}
          emptyTitle="No Security Alerts"
          emptySub="All devices are recognized and secure"
        />

        <AlertSection
          type="screen"
          title="Screen Time Violations"
          icon={Monitor}
          accent="orange"
          alerts={filteredScreen}
          emptyIcon={Eye}
          emptyTitle="No Screen Time Violations"
          emptySub="All devices are within their daily limits"
        />

        <AlertSection
          type="curfew"
          title="Curfew Violations"
          icon={Moon}
          accent="indigo"
          alerts={filteredCurfew}
          emptyIcon={Moon}
          emptyTitle="No Curfew Violations"
          emptySub="All devices are outside curfew hours"
        />
      </div>

      {/* ── Footer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Activity className="w-3 h-3" />
          Alerts are generated in real-time by the monitoring engine
        </p>
      </motion.div>
    </div>
  )
}
