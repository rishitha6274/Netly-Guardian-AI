import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, User, Timer, Zap } from 'lucide-react'

/* ─── Usage Bar ───────────────────────────────────────────────────────── */

const UsageBar = ({ usage, limit }) => {
  const pct = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0
  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between text-xs text-red-300 mb-1">
        <span className="font-medium flex items-center gap-1">
          <Timer className="w-3 h-3" />
          {usage} / {limit} mins
        </span>
        <span className="opacity-70 font-mono">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-red-400 to-orange-400 relative"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md" />
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Alert Card ──────────────────────────────────────────────────────── */

const AlertCard = ({ alert, index }) => {
  const typeLabel = (alert.type || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-4 sm:p-5"
    >
      {/* Animated warning pulse */}
      <div className="absolute top-4 right-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      </div>

      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex-shrink-0 p-2.5 rounded-xl bg-red-500/20 border border-red-500/30">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-white">{alert.name || 'Unknown Device'}</h4>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/25">
              {typeLabel}
            </span>
          </div>
          <p className="text-sm text-red-200/90 mt-1">{alert.message || ''}</p>

          {alert.usage != null && alert.limit != null && (
            <UsageBar usage={alert.usage} limit={alert.limit} />
          )}
        </div>

        {alert.owner && (
          <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">{alert.owner}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Empty State ─────────────────────────────────────────────────────── */

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 text-center relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl" />
    <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/25 mb-3">
        <Zap className="w-7 h-7 text-emerald-400" />
      </div>
      <p className="text-base font-semibold text-emerald-300">All Clear</p>
      <p className="text-xs text-slate-500 mt-1">No devices have exceeded their limits</p>
    </div>
  </motion.div>
)

/* ─── Panel ───────────────────────────────────────────────────────────── */

export default function DashboardAlertPanel({ alerts = [] }) {
  if (!alerts.length) return <EmptyState />

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/25">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-red-300">
          Active Alerts
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/25">
          {alerts.length}
        </span>
      </div>

      {alerts.map((alert, idx) => (
        <AlertCard key={alert.id || alert.mac || idx} alert={alert} index={idx} />
      ))}
    </div>
  )
}
