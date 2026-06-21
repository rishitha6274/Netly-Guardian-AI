import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ban, ShieldCheck, ShieldAlert, AlertTriangle, Clock,
  Search, Activity, History, Filter, ArrowUpDown, X,
  Monitor, Wifi, WifiOff, CheckCircle, Trash2,
} from 'lucide-react'
import { useApi } from '../data/api'

/* =========================================================================
   Helpers
   ========================================================================= */

const ACTION_CONFIG = {
  device_blocked: {
    icon: Ban,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    label: 'Device Blocked',
    dot: 'bg-red-400',
  },
  device_unblocked: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    label: 'Device Unblocked',
    dot: 'bg-emerald-400',
  },
  device_restricted: {
    icon: ShieldAlert,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    label: 'Device Restricted',
    dot: 'bg-orange-400',
  },
  restriction_removed: {
    icon: ShieldCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    label: 'Restriction Removed',
    dot: 'bg-blue-400',
  },
}

const getActionConfig = (type) => ACTION_CONFIG[type] || {
  icon: Activity,
  color: 'text-slate-400',
  bg: 'bg-slate-500/10',
  border: 'border-slate-500/25',
  label: type || 'Unknown Action',
  dot: 'bg-slate-400',
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
   Stat Card
   ========================================================================= */

function StatCard({ label, value, icon: Icon, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
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
   Timeline Item
   ========================================================================= */

function TimelineItem({ action, idx }) {
  const config = getActionConfig(action.type)
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.5) }}
      className="flex items-start gap-4 relative group"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${config.dot} ring-4 ring-white/[0.03] z-10`} />
        <div className="flex-1 w-px bg-white/5 min-h-[40px] group-last:hidden" />
      </div>

      {/* Content card */}
      <div className={`flex-1 pb-6 rounded-xl border ${config.border} ${config.bg} p-3.5`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg ${config.bg} border ${config.border} flex-shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">{config.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Device: <span className="font-mono text-slate-300">{action.device || 'N/A'}</span>
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] font-mono text-slate-500">{formatTimestamp(action.timestamp)}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(action.timestamp)}</p>
          </div>
        </div>
        {action.details && (
          <p className="text-[11px] text-slate-500 mt-2 ml-1 border-t border-white/5 pt-2">
            {action.details}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Action History Page
   ========================================================================= */

export default function ActionHistory() {
  const { data: actionsData, loading: actionsLoading, error: actionsError, refresh: refreshActions } = useApi('/actions', { pollMs: 30000 })
  const { data: statsData, loading: statsLoading } = useApi('/action-stats', { pollMs: 30000 })

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  const actions = useMemo(() => (Array.isArray(actionsData) ? actionsData : []), [actionsData])
  const stats = useMemo(() => ({
    total: statsData?.total_actions ?? 0,
    blocked: statsData?.devices_blocked ?? 0,
    unblocked: statsData?.devices_unblocked ?? 0,
    restricted: statsData?.devices_restricted ?? 0,
    removed: statsData?.restrictions_removed ?? 0,
  }), [statsData])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...actions]

    if (typeFilter !== 'all') {
      result = result.filter(a => a.type === typeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        (a.type || '').toLowerCase().includes(q) ||
        (a.device || '').toLowerCase().includes(q) ||
        (a.details || '').toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp.replace(' ', 'T')).getTime() : 0
      const tb = b.timestamp ? new Date(b.timestamp.replace(' ', 'T')).getTime() : 0
      return sortOrder === 'newest' ? tb - ta : ta - tb
    })

    return result
  }, [actions, typeFilter, search, sortOrder])

  const loading = actionsLoading && actions.length === 0
  const error = actionsError

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 skeleton rounded-lg" />
        <div className="h-4 w-72 skeleton rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4 space-y-2">
              <div className="h-3 w-20 skeleton rounded" /><div className="h-8 w-12 skeleton rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <History className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load action history</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button onClick={refreshActions}
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
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/10 border border-blue-500/25">
                <History className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Action History</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                {stats.total}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 ml-1">
              Audit trail of all enforcement actions taken across the network
            </p>
          </div>
          <button onClick={refreshActions}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
          >
            <Clock className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          <StatCard label="Total Actions" value={stats.total} icon={History} color="text-blue-400" bg="bg-blue-500/10" delay={0.05} />
          <StatCard label="Blocked" value={stats.blocked} icon={Ban} color="text-red-400" bg="bg-red-500/10" delay={0.1} />
          <StatCard label="Unblocked" value={stats.unblocked} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-500/10" delay={0.15} />
          <StatCard label="Restricted" value={stats.restricted} icon={ShieldAlert} color="text-orange-400" bg="bg-orange-500/10" delay={0.2} />
          <StatCard label="Removed" value={stats.removed} icon={ShieldCheck} color="text-blue-400" bg="bg-blue-500/10" delay={0.25} />
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search type, device, details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'device_blocked', label: 'Blocked', dot: 'bg-red-400' },
            { value: 'device_unblocked', label: 'Unblocked', dot: 'bg-emerald-400' },
            { value: 'device_restricted', label: 'Restricted', dot: 'bg-orange-400' },
            { value: 'restriction_removed', label: 'Removed', dot: 'bg-blue-400' },
          ].map(opt => {
            const isActive = typeFilter === opt.value
            return (
              <button key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    : 'bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
                }`}
              >
                {opt.dot && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <div className="relative">
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 outline-none focus:border-blue-500/50 cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} of {actions.length} actions
        </span>
      </motion.div>

      {/* ── Timeline ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/5 mb-4">
              {search || typeFilter !== 'all' ? (
                <Search className="w-8 h-8 text-slate-600" />
              ) : (
                <History className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <p className="text-base font-semibold text-slate-400">
              {search || typeFilter !== 'all' ? 'No matching actions' : 'No actions recorded'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {search || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Enforcement actions will appear here as they occur'}
            </p>
            {(search || typeFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setTypeFilter('all') }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
              >Clear filters</button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            <AnimatePresence>
              {filtered.map((action, idx) => (
                <TimelineItem key={`${action.timestamp}-${action.type}-${idx}`} action={action} idx={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} action{filtered.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Real-time updates
          </span>
        </div>
      </motion.div>
    </div>
  )
}
