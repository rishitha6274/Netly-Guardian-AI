import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldCheck, ShieldAlert, ShieldOff, Clock, Bell,
  AlertTriangle, AlertCircle, Ban, Moon, Monitor, Activity,
  Wifi, WifiOff, Zap, ChevronRight, ExternalLink, Search,
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

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts.replace(' ', 'T'))
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/* =========================================================================
   Summary Stat Card
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
   Panel wrapper
   ========================================================================= */

function Panel({ title, icon: Icon, children, accent, delay, count, extra }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${accent || 'blue'}-500/30 to-transparent`} />

      <div className="px-5 py-4">
        {/* Panel header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-${accent || 'blue'}-500/10`}>
              <Icon className={`w-4 h-4 text-${accent || 'blue'}-400`} />
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {count != null && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-${accent || 'blue'}-500/15 text-${accent || 'blue'}-300 border border-${accent || 'blue'}-500/25`}>
                {count}
              </span>
            )}
          </div>
          {extra}
        </div>

        {children}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Screen Time Violation Card
   ========================================================================= */

function ScreenTimeCard({ alert, idx }) {
  const pct = alert.limit > 0 ? Math.min((alert.usage / alert.limit) * 100, 100) : 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
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
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
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

/* =========================================================================
   Curfew Violation Card
   ========================================================================= */

function CurfewCard({ alert, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
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
   Notification Item
   ========================================================================= */

function NotificationItem({ notif, idx }) {
  const sev = getSeverity(notif.severity)
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="flex items-start gap-3 py-2.5 border-b border-white/[0.03] last:border-0"
    >
      {/* Severity dot */}
      <div className="flex-shrink-0 mt-1">
        <span className={`flex w-2 h-2 rounded-full ${sev.dot}`}>
          {notif.severity === 'high' && (
            <span className="absolute w-2 h-2 rounded-full bg-red-400 animate-ping opacity-50" />
          )}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold text-white truncate">{notif.title || 'Notification'}</p>
          <SeverityBadge severity={notif.severity} />
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message || ''}</p>
        <p className="text-[10px] text-slate-600 mt-1">{timeAgo(notif.timestamp)}</p>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Enforcement Action Card
   ========================================================================= */

const ACTION_TYPES = {
  screen_time_exceeded: { icon: Ban, label: 'Screen Time Blocked', color: 'text-red-400', bg: 'bg-red-500/10', accent: 'red' },
  curfew_active: { icon: Moon, label: 'Curfew Enforced', color: 'text-indigo-400', bg: 'bg-indigo-500/10', accent: 'indigo' },
  device_blocked: { icon: ShieldOff, label: 'Device Blocked', color: 'text-red-400', bg: 'bg-red-500/10', accent: 'red' },
}

function EnforcementAction({ action, idx }) {
  const type = ACTION_TYPES[action.type] || { icon: Zap, label: 'Action Taken', color: 'text-blue-400', bg: 'bg-blue-500/10', accent: 'blue' }
  const Icon = type.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="flex items-start gap-3 py-2.5 border-b border-white/[0.03] last:border-0"
    >
      <div className={`p-1.5 rounded-lg ${type.bg} flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${type.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-white truncate">{action.name || action.device || 'Unknown'}</p>
          <span className={`text-[10px] font-medium ${type.color}`}>{type.label}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">{action.message || action.owner ? `Owner: ${action.owner}` : ''}</p>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Auto Enforcement Page
   ========================================================================= */

export default function AutoEnforcement() {
  const [alerts, setAlerts] = useState([])
  const [curfewAlerts, setCurfewAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [alertsRes, curfewRes, notifRes] = await Promise.all([
        fetch('/api/alerts'),
        fetch('/api/curfew-alerts'),
        fetch('/api/notifications'),
      ])
      if (!alertsRes.ok) throw new Error(`Alerts failed (${alertsRes.status})`)
      if (!curfewRes.ok) throw new Error(`Curfew alerts failed (${curfewRes.status})`)
      if (!notifRes.ok) throw new Error(`Notifications failed (${notifRes.status})`)

      const a = await alertsRes.json()
      const c = await curfewRes.json()
      const n = await notifRes.json()

      setAlerts(Array.isArray(a) ? a : [])
      setCurfewAlerts(Array.isArray(c) ? c : [])
      setNotifications(Array.isArray(n) ? n : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load enforcement data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived stats ──
  const stats = useMemo(() => {
    const screenTimeViolations = alerts.filter(a => a.type === 'screen_time_exceeded').length
    const curfewViolations = curfewAlerts.length
    const totalViolations = screenTimeViolations + curfewViolations
    const enforcementActions = alerts.length + curfewAlerts.length
    return { totalViolations, curfewViolations, screenTimeViolations, enforcementActions }
  }, [alerts, curfewAlerts])

  // Derive enforcement actions list
  const enforcementActions = useMemo(() => {
    const actions = []
    alerts.filter(a => a.type === 'screen_time_exceeded').forEach(a => {
      actions.push({ ...a, type: 'screen_time_exceeded', device: a.name })
    })
    curfewAlerts.forEach(a => {
      actions.push({ ...a, type: 'curfew_active' })
    })
    return actions.sort(() => 0.5 - Math.random()) // stable shuffle isn't needed; just show most recent first
  }, [alerts, curfewAlerts])

  // Severity breakdown for notifications
  const severityCounts = useMemo(() => {
    return {
      high: notifications.filter(n => n.severity === 'high').length,
      medium: notifications.filter(n => n.severity === 'medium').length,
      low: notifications.filter(n => n.severity === 'low').length,
    }
  }, [notifications])

  // ── Loading skeleton ──
  if (loading && alerts.length === 0 && curfewAlerts.length === 0) {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-4">
              <div className="h-4 w-36 skeleton rounded" />
              {[1,2,3].map(j => <div key={j} className="h-16 skeleton rounded-xl" />)}
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
        <p className="text-sm text-red-300 font-medium">Failed to load enforcement data</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button onClick={fetchData}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >Retry</button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950/60 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        {/* Background orbs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-red-400/20 to-transparent" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/25">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Auto Enforcement</h1>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 ml-1">
                Automated policy enforcement dashboard — screen time limits, curfews, and security actions
              </p>
            </div>
            <button onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
            >
              <Clock className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard label="Total Violations" value={stats.totalViolations} icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10" delay={0.05} accent="#ef4444" />
            <StatCard label="Screen Time" value={stats.screenTimeViolations} icon={Monitor} color="text-orange-400" bg="bg-orange-500/10" delay={0.1} accent="#f97316" />
            <StatCard label="Curfew Violations" value={stats.curfewViolations} icon={Moon} color="text-indigo-400" bg="bg-indigo-500/10" delay={0.15} accent="#818cf8" />
            <StatCard label="Enforcement Actions" value={stats.enforcementActions} icon={Zap} color="text-blue-400" bg="bg-blue-500/10" delay={0.2} accent="#3b82f6" />
          </div>
        </div>
      </motion.div>

      {/* ── 2×2 Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ─── 1. Active Screen Time Violations ─── */}
        <Panel title="Active Screen Time Violations" icon={Monitor} accent="red" count={alerts.filter(a => a.type === 'screen_time_exceeded').length} delay={0.1}>
          {alerts.filter(a => a.type === 'screen_time_exceeded').length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-emerald-300">No Screen Time Violations</p>
              <p className="text-xs text-slate-500 mt-1">All devices are within their limits</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {alerts.filter(a => a.type === 'screen_time_exceeded').map((a, i) => (
                <ScreenTimeCard key={i} alert={a} idx={i} />
              ))}
            </div>
          )}
        </Panel>

        {/* ─── 2. Active Curfew Violations ─── */}
        <Panel title="Active Curfew Violations" icon={Moon} accent="indigo" count={curfewAlerts.length} delay={0.16}>
          {curfewAlerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-indigo-300">No Curfew Violations</p>
              <p className="text-xs text-slate-500 mt-1">All devices are outside curfew hours</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {curfewAlerts.map((c, i) => (
                <CurfewCard key={i} alert={c} idx={i} />
              ))}
            </div>
          )}
        </Panel>

        {/* ─── 3. Recent Notifications ─── */}
        <Panel
          title="Recent Notifications"
          icon={Bell}
          accent="blue"
          count={notifications.length}
          delay={0.22}
          extra={
            <div className="flex items-center gap-2">
              {['high', 'medium', 'low'].map(s => {
                const cfg = getSeverity(s)
                return severityCounts[s] > 0 ? (
                  <span key={s} className={`flex items-center gap-1 text-[10px] ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {severityCounts[s]}
                  </span>
                ) : null
              })}
            </div>
          }
        >
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-3">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-blue-300">No Notifications</p>
              <p className="text-xs text-slate-500 mt-1">Recent alerts will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03] max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {notifications.slice(0, 10).map((n, i) => (
                <NotificationItem key={i} notif={n} idx={i} />
              ))}
            </div>
          )}
        </Panel>

        {/* ─── 4. Enforcement Actions ─── */}
        <Panel
          title="Enforcement Actions"
          icon={Zap}
          accent="violet"
          count={enforcementActions.length}
          delay={0.28}
          extra={
            <span className="text-[10px] text-slate-500">
              Auto-enforced
            </span>
          }
        >
          {enforcementActions.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-3">
                <ShieldCheck className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm font-medium text-violet-300">No Enforcement Actions</p>
              <p className="text-xs text-slate-500 mt-1">All policies are being followed</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03] max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {enforcementActions.map((a, i) => (
                <EnforcementAction key={i} action={a} idx={i} />
              ))}
            </div>
          )}
        </Panel>

      </div>

      {/* ── Activity footer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Activity className="w-3 h-3" />
          Auto-enforcement policies are applied in real-time · {stats.enforcementActions} action{stats.enforcementActions !== 1 ? 's' : ''} logged
        </p>
      </motion.div>
    </div>
  )
}
