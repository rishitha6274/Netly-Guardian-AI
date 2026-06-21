import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Wifi, WifiOff, Radio, TrendingUp,
  ArrowRightLeft, Clock, Target, Network,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const formatNumber = (n) => {
  if (!n && n !== 0) return '—'
  return n.toLocaleString()
}

/* =========================================================================
   Stat Card
   ========================================================================= */

function ActivityStatCard({ label, value, sub, icon: Icon, color, delay, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 card-shine"
    >
      {/* Corner decorations */}
      <div className="absolute top-0 right-0 w-20 h-20">
        <div className="absolute top-0 right-0 w-10 h-px bg-gradient-to-l from-transparent via-white/15 to-transparent" />
        <div className="absolute top-0 right-0 h-10 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      </div>

      {/* Accent glow */}
      {accent && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.06] blur-2xl pointer-events-none"
          style={{ backgroundColor: accent }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        </div>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.15 }}
          className="text-2xl font-bold text-white tabular-nums"
        >
          {value}
        </motion.span>
        {sub && (
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Network Activity Analytics Page
   ========================================================================= */

export default function NetworkActivityAnalytics() {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/activity')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setActivity(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-72 skeleton rounded-lg" />
        <div className="h-4 w-80 skeleton rounded mt-2" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-3">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="h-8 w-20 skeleton rounded" />
              <div className="h-3 w-24 skeleton rounded" />
            </div>
          ))}
        </div>

        {/* Most active device skeleton */}
        <div className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-6">
          <div className="h-5 w-48 skeleton rounded mb-4" />
          <div className="h-16 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <Activity className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load activity data</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={fetchActivity}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </motion.div>
    )
  }

  const { activity_count, most_active_device, total_joins, total_leaves } = activity || {}

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Network className="w-6 h-6 text-blue-400" />
              Network Activity Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitor device join/leave patterns and overall network activity
            </p>
          </div>
          <button
            onClick={fetchActivity}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActivityStatCard
          label="Activity Count"
          value={formatNumber(activity_count)}
          sub="Total network events recorded"
          icon={Activity}
          color="#3b82f6"
          delay={0}
          accent="#3b82f6"
        />
        <ActivityStatCard
          label="Total Joins"
          value={formatNumber(total_joins)}
          sub="Devices connected to network"
          icon={Wifi}
          color="#22c55e"
          delay={0.08}
          accent="#22c55e"
        />
        <ActivityStatCard
          label="Total Leaves"
          value={formatNumber(total_leaves)}
          sub="Devices disconnected"
          icon={WifiOff}
          color="#f97316"
          delay={0.16}
          accent="#f97316"
        />
        <ActivityStatCard
          label="Join : Leave Ratio"
          value={total_leaves > 0
            ? (total_joins / total_leaves).toFixed(2)
            : total_joins > 0 ? '∞' : '—'}
          sub={total_joins > 0 && total_leaves > 0
            ? `${total_joins > total_leaves ? 'More joins' : 'More leaves'} than leaves`
            : total_joins > 0 ? 'All joins, no leaves' : 'No activity'}
          icon={ArrowRightLeft}
          color="#a78bfa"
          delay={0.24}
          accent="#a78bfa"
        />
      </div>

      {/* ── Most Active Device Spotlight ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Most Active Device</h3>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 p-5"
          >
            {/* Data flow lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
              <div className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
              <div className="absolute top-[50%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-[75%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                {/* Pulsing icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-70" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white font-mono truncate">
                    {most_active_device || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This device generated the most network activity
                  </p>
                </div>

                {/* Activity badge */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-blue-400 tabular-nums">
                    {formatNumber(activity_count)}
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">events</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Activity Summary Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-semibold text-white">Activity Summary</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Join rate */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-400">Join Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {total_joins > 0 && activity_count > 0
                    ? `${Math.round((total_joins / activity_count) * 100)}%`
                    : '—'}
                </span>
                <span className="text-[11px] text-slate-500">of all events</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: total_joins > 0 && activity_count > 0 ? `${(total_joins / activity_count) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>

            {/* Leave rate */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <WifiOff className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium text-slate-400">Leave Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-orange-400 tabular-nums">
                  {total_leaves > 0 && activity_count > 0
                    ? `${Math.round((total_leaves / activity_count) * 100)}%`
                    : '—'}
                </span>
                <span className="text-[11px] text-slate-500">of all events</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: total_leaves > 0 && activity_count > 0 ? `${(total_leaves / activity_count) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-orange-500"
                />
              </div>
            </div>

            {/* Net flow */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-400">Net Flow</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums"
                  style={{ color: (total_joins - total_leaves) >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {(total_joins - total_leaves) >= 0 ? '+' : ''}{formatNumber((total_joins || 0) - (total_leaves || 0))}
                </span>
                <span className="text-[11px] text-slate-500">devices</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {(total_joins - total_leaves) >= 0
                  ? 'More devices joining than leaving'
                  : 'More devices leaving than joining'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Data flow decorations ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Activity className="w-3 h-3" />
          Network activity data captures all device join and leave events · Updated in real-time
        </p>
      </motion.div>
    </div>
  )
}
