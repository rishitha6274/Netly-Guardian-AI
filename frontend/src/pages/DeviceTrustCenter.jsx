import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, ShieldCheck, ShieldAlert, Search, Smartphone,
  Laptop, Tablet, Tv, Radio, HelpCircle, Wifi, User,
  Activity, TrendingDown, TrendingUp,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const DeviceIcon = ({ type, className = 'w-5 h-5' }) => {
  const map = { phone: Smartphone, laptop: Laptop, tablet: Tablet, tv: Tv, iot: Radio, router: Wifi }
  const Icon = map[type] || HelpCircle
  return <Icon className={className} />
}

const detectType = (name) => {
  const lower = String(name || '').toLowerCase()
  if (['router', 'gateway', 'access point'].some(w => lower.includes(w))) return 'router'
  if (['iphone', 'phone', 'pixel', 'galaxy'].some(w => lower.includes(w))) return 'phone'
  if (['laptop', 'macbook', 'notebook', 'thinkpad'].some(w => lower.includes(w))) return 'laptop'
  if (['ipad', 'tablet'].some(w => lower.includes(w))) return 'tablet'
  if (['tv', 'television', 'apple tv', 'roku'].some(w => lower.includes(w))) return 'tv'
  if (['thermostat', 'camera', 'speaker', 'light', 'plug', 'sensor'].some(w => lower.includes(w))) return 'iot'
  return 'unknown'
}

/* =========================================================================
   TrustScoreCard
   ========================================================================= */

function TrustScoreCard({ device, idx }) {
  const score = device.trust_score ?? 0
  const status = device.status || (score >= 80 ? 'Safe' : 'Suspicious')
  const isSafe = status === 'Safe'

  const iconType = detectType(device.name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Top gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
        isSafe
          ? 'from-emerald-500/0 via-emerald-500/40 to-emerald-500/0'
          : 'from-red-500/0 via-red-500/40 to-red-500/0'
      }`} />

      {/* Status glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isSafe ? 'bg-emerald-500' : 'bg-red-500'
      }`} />

      <div className="p-5 relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isSafe ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              <DeviceIcon type={iconType} className={`w-5 h-5 ${
                isSafe ? 'text-emerald-400' : 'text-red-400'
              }`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate max-w-[180px]">
                {device.name || 'Unnamed'}
              </h3>
              {device.owner && device.owner !== 'Unknown' && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3" />
                  {device.owner}
                </p>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border flex-shrink-0 ${
            isSafe
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border-red-500/30'
          }`}>
            {isSafe ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <ShieldAlert className="w-3 h-3" />
            )}
            {status}
          </span>
        </div>

        {/* IP + MAC + Owner row */}
        <div className="space-y-1 mb-4">
          {device.ip && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-mono w-6">IP</span>
              <span className="font-mono text-slate-400">{device.ip}</span>
            </div>
          )}
          {device.mac && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-mono w-6">MAC</span>
              <span className="font-mono text-slate-500">{device.mac}</span>
            </div>
          )}
          {(!device.owner || device.owner === 'Unknown') && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-mono w-6">Owner</span>
              <span className="text-slate-500">Unknown</span>
            </div>
          )}
        </div>

        {/* Trust Score */}
        <div className="mb-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Trust Score
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className={`font-bold tabular-nums text-base ${
                isSafe ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {score}
              <span className="text-xs text-slate-600 font-normal">/100</span>
            </motion.span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(score, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 + idx * 0.05, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isSafe
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
            />
          </div>
        </div>

        {/* Score level label */}
        <div className="flex items-center justify-end mt-1">
          <span className={`text-[10px] font-medium ${
            score >= 80 ? 'text-emerald-400' 
            : score >= 50 ? 'text-amber-400'
            : 'text-red-400'
          }`}>
            {score >= 80 ? 'Excellent' : score >= 50 ? 'Moderate' : 'Poor'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Device Trust Center Page
   ========================================================================= */

export default function DeviceTrustCenter() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchTrustScores = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/trust-scores')
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
      const data = await res.json()
      // Sort by trust_score descending
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0)
      )
      setDevices(sorted)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load trust scores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrustScores()
  }, [fetchTrustScores])

  // Client-side filtering
  const filtered = devices.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(d.name || '').toLowerCase().includes(q)
        || String(d.ip || '').toLowerCase().includes(q)
        || String(d.mac || '').toLowerCase().includes(q)
        || String(d.owner || '').toLowerCase().includes(q)
        || String(d.status || '').toLowerCase().includes(q)
  })

  const safeCount = devices.filter(d => d.status === 'Safe' || (d.trust_score ?? 0) >= 80).length
  const suspiciousCount = devices.length - safeCount

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-400" />
          Device Trust Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Trust scores and risk assessment for all network devices
        </p>
      </motion.div>

      {/* ── Summary Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-netly-bg-secondary border border-white/5">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white font-semibold">{devices.length}</span>
          <span className="text-xs text-slate-500">Total Devices</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300 font-semibold">{safeCount}</span>
          <span className="text-xs text-emerald-400/70">Safe</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300 font-semibold">{suspiciousCount}</span>
          <span className="text-xs text-red-400/70">Suspicious</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search devices…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-56 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </motion.div>

      {/* ── Device Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 skeleton rounded" />
                  <div className="h-2 w-16 skeleton rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 skeleton rounded" />
                <div className="h-2 skeleton rounded w-3/4" />
              </div>
              <div className="h-2.5 skeleton rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
        >
          <ShieldAlert className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <p className="text-sm text-red-300 font-medium">Failed to load trust scores</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
          <button
            onClick={fetchTrustScores}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-500">
            {search ? 'No devices match your search' : 'No trust score data available'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d, idx) => (
            <TrustScoreCard key={d.mac || d.ip || idx} device={d} idx={idx} />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      {!loading && devices.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-4 pb-2"
        >
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" />
            Trust scores are updated periodically based on device behavior and network activity
          </p>
        </motion.div>
      )}
    </div>
  )
}
