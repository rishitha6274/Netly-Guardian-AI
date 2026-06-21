import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ban, ShieldOff, ShieldCheck, Search, Clock, Wifi, WifiOff,
  AlertTriangle, X, CheckCircle, Loader2, User, Monitor,
  Shield, ShieldAlert, Lock, Unlock, SlidersHorizontal,
  Activity, Moon, FileText, Timer,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const formatMinutes = (m) => {
  if (m == null && m !== 0) return '—'
  if (m === 0) return '0 min'
  if (m < 60) return `${Math.round(m)} min`
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return min > 0 ? `${h}h ${min}m` : `${h}h`
}

const formatLimit = (hours) => {
  if (hours == null || hours === 0) return 'No limit'
  return `${hours} hr${hours !== 1 ? 's' : ''}/d`
}

const formatCurfew = (start, end) => {
  if (!start && !end) return 'No curfew'
  if (!start || !end) return `${start || '—'} – ${end || '—'}`
  return `${start} – ${end}`
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
   Confirmation Dialog
   ========================================================================= */

function ConfirmDialog({ isBlock, device, onConfirm, onCancel, loading }) {
  const mac = device?.mac || device || ''
  const name = device?.name || mac

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-2xl bg-netly-bg-secondary border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Background glow */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isBlock ? 'bg-red-500/15' : 'bg-emerald-500/15'
          }`} />

          <div className="relative z-10 p-6">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-4 ${
              isBlock
                ? 'bg-red-500/15 border-red-500/25'
                : 'bg-emerald-500/15 border-emerald-500/25'
            }`}>
              {isBlock ? (
                <ShieldOff className="w-8 h-8 text-red-400" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-white">
              {isBlock ? 'Block Device' : 'Unblock Device'}
            </h2>

            {/* Message */}
            <div className="mt-2 space-y-2">
              <p className="text-sm text-slate-400">
                {isBlock
                  ? `Are you sure you want to block this device? It will lose network access until unblocked.`
                  : `Are you sure you want to unblock this device? It will regain full network access.`
                }
              </p>
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 font-medium">{(typeof device === 'object' ? device.name : null) || 'Unknown Device'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Wifi className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-500">{mac}</span>
                </div>
                {typeof device === 'object' && device.owner && device.owner !== 'Unknown' && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500">{device.owner}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  isBlock
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {isBlock ? 'Blocking…' : 'Unblocking…'}</>
                ) : (
                  <>{isBlock ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} {isBlock ? 'Block' : 'Unblock'}</>
                )}
              </button>
            </div>

            {/* Warning for block */}
            {isBlock && (
              <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-300/80">
                  Blocking a device immediately terminates its network access. You can unblock it at any time.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* =========================================================================
   Device Card
   ========================================================================= */

function DeviceBlockCard({ device, blockedMacs, onBlock, onUnblock }) {
  const mac = device.mac?.toLowerCase() || ''
  const isBlocked = blockedMacs.includes(mac)
  const isKnown = device.status === 'known'
  const isActive = !isBlocked && isKnown
  const isUnknown = !isBlocked && !isKnown
  const hasCurfew = device.curfew_start || device.curfew_end
  const hasNote = device.note && device.note.trim().length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`relative group rounded-2xl border overflow-hidden transition-all duration-300 ${
        isBlocked
          ? 'bg-gradient-to-br from-red-950/40 via-red-900/10 to-netly-bg-secondary border-red-500/25 shadow-lg shadow-red-500/5'
          : isActive
          ? 'bg-netly-bg-secondary border-white/5 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5'
          : 'bg-netly-bg-secondary border-white/5 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5'
      }`}
    >
      {/* Top accent */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${
        isBlocked ? 'red' : isActive ? 'emerald' : 'amber'
      }-500/50 to-transparent`} />

      {/* Scan line on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="scan-line" />
      </div>

      <div className="p-5 relative z-10">
        {/* ── Header row: Name, Owner, Status badge ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
              isBlocked ? 'bg-red-500/15' : isKnown ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}>
              <Monitor className={`w-5 h-5 ${
                isBlocked ? 'text-red-400' : isKnown ? 'text-emerald-400' : 'text-amber-400'
              }`} />
            </div>
            <div className="min-w-0">
              <h3 className={`text-sm font-bold truncate ${isBlocked ? 'text-red-200' : 'text-white'}`}>
                {device.name || 'Unnamed Device'}
              </h3>
              {device.owner && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3" />
                  {device.owner}
                </p>
              )}
            </div>
          </div>

          {/* Status badge — green for active (known+unblocked), red for blocked */}
          <div className="flex-shrink-0">
            {isBlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                <Ban className="w-3 h-3" />
                Blocked
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                isKnown
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isKnown ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                {isKnown ? 'Active' : 'Unknown'}
              </span>
            )}
          </div>
        </div>

        {/* ── IP + MAC row ── */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-3 text-[11px]">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
            isBlocked ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.03] border-white/5'
          }`}>
            <Wifi className="w-3 h-3 text-slate-500" />
            <span className="font-mono text-slate-400">{device.ip || '—'}</span>
          </div>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-500">{device.mac || '—'}</span>
        </div>

        {/* ── Detail rows: Minutes Online, Daily Limit, Curfew, Notes ── */}
        <div className="space-y-2 mb-3">
          {/* Minutes Online */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Online
            </span>
            <span className="font-mono font-semibold text-slate-300 tabular-nums">
              {formatMinutes(device.minutes_online)}
            </span>
          </div>

          {/* Daily Limit */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Timer className="w-3 h-3" />
              Daily Limit
            </span>
            <span className="font-mono text-slate-300 tabular-nums">
              {formatLimit(device.daily_limit)}
            </span>
          </div>

          {/* Curfew */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Moon className="w-3 h-3" />
              Curfew
            </span>
            <span className={`font-mono tabular-nums ${
              hasCurfew ? 'text-indigo-300' : 'text-slate-600'
            }`}>
              {formatCurfew(device.curfew_start, device.curfew_end)}
            </span>
          </div>

          {/* Notes */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes
            </span>
            <span className={`truncate max-w-[180px] text-right ${hasNote ? 'text-slate-300' : 'text-slate-600'}`}>
              {hasNote ? device.note : 'No notes'}
            </span>
          </div>
        </div>

        {/* Blocked status banner */}
        {isBlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-3 p-2.5 rounded-xl bg-red-500/5 border border-red-500/15"
          >
            <p className="text-[11px] text-red-300/80 flex items-center gap-1.5">
              <ShieldOff className="w-3.5 h-3.5 text-red-400" />
              This device is currently blocked from the network
            </p>
          </motion.div>
        )}

        {/* ── Action button ── */}
        {isBlocked ? (
          <button
            onClick={() => onUnblock(device)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-sm font-medium"
          >
            <Unlock className="w-4 h-4" />
            Unblock Device
          </button>
        ) : (
          <button
            onClick={() => onBlock(device)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all text-sm font-medium"
          >
            <Ban className="w-4 h-4" />
            Block Device
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Orphan Blocked Device Card (MAC not in device profiles)
   ========================================================================= */

function OrphanBlockedCard({ mac, onUnblock }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-2xl bg-gradient-to-br from-red-950/40 via-red-900/10 to-netly-bg-secondary border border-red-500/25 overflow-hidden shadow-lg shadow-red-500/5"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-red-500/15 flex-shrink-0">
              <ShieldOff className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-red-200 truncate">Unknown Device</h3>
              <p className="text-xs text-slate-500 mt-0.5">Not in device profiles</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <Ban className="w-3 h-3" />
            Blocked
          </span>
        </div>

        <div className="mb-4 text-[11px]">
          <span className="font-mono text-slate-400 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/5">{mac}</span>
        </div>

        <div className="mb-3 p-2.5 rounded-xl bg-red-500/5 border border-red-500/15">
          <p className="text-[11px] text-red-300/80 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            This MAC is blocked but not found in the device registry
          </p>
        </div>

        <button
          onClick={() => onUnblock(mac)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-sm font-medium"
        >
          <Unlock className="w-4 h-4" />
          Unblock Device
        </button>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Device Blocking Page
   ========================================================================= */

const TABS = [
  { id: 'all', label: 'All Devices', icon: Monitor },
  { id: 'known', label: 'Known', icon: ShieldCheck },
  { id: 'unknown', label: 'Unknown', icon: ShieldAlert },
  { id: 'blocked', label: 'Blocked', icon: Ban },
]

export default function DeviceBlocking() {
  const [profiles, setProfiles] = useState([])
  const [blockedMacs, setBlockedMacs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [confirmTarget, setConfirmTarget] = useState(null) // { isBlock, device }
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [profilesRes, blockedRes] = await Promise.all([
        fetch('/api/device-profiles'),
        fetch('/api/blocked-devices'),
      ])
      if (!profilesRes.ok) throw new Error(`Profiles failed (${profilesRes.status})`)
      if (!blockedRes.ok) throw new Error(`Blocked list failed (${blockedRes.status})`)
      const profilesData = await profilesRes.json()
      const blockedData = await blockedRes.json()
      setProfiles(Array.isArray(profilesData) ? profilesData : [])
      setBlockedMacs(Array.isArray(blockedData) ? blockedData.map(m => m.toLowerCase()) : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Find orphan blocked MACs (blocked but not in profiles)
  const orphanMacs = useMemo(() => {
    const profileMacs = new Set(profiles.map(d => d.mac?.toLowerCase()))
    return blockedMacs.filter(m => !profileMacs.has(m))
  }, [profiles, blockedMacs])

  // Augment profiles with blocked status
  const augmentedProfiles = useMemo(() => {
    return profiles.map(d => ({
      ...d,
      _blocked: blockedMacs.includes(d.mac?.toLowerCase() || ''),
    }))
  }, [profiles, blockedMacs])

  // Filter + tab logic
  const filtered = useMemo(() => {
    let result = [...augmentedProfiles]

    if (activeTab === 'blocked') {
      result = result.filter(d => d._blocked)
    } else if (activeTab === 'known') {
      result = result.filter(d => d.status === 'known' && !d._blocked)
    } else if (activeTab === 'unknown') {
      result = result.filter(d => d.status === 'unknown' && !d._blocked)
    }
    // 'all' shows everything

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.owner || '').toLowerCase().includes(q) ||
        (d.mac || '').toLowerCase().includes(q) ||
        (d.ip || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [augmentedProfiles, activeTab, search])

  const handleBlock = async () => {
    if (!confirmTarget) return
    setSubmitting(true)
    const mac = confirmTarget.device?.mac || confirmTarget.device
    try {
      const res = await fetch('/api/block-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac }),
      })
      if (!res.ok) throw new Error(`Block failed (${res.status})`)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
      setConfirmTarget(null)
    }
  }

  const handleUnblock = async () => {
    if (!confirmTarget) return
    setSubmitting(true)
    const mac = confirmTarget.device?.mac || confirmTarget.device
    try {
      const res = await fetch('/api/unblock-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac }),
      })
      if (!res.ok) throw new Error(`Unblock failed (${res.status})`)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
      setConfirmTarget(null)
    }
  }

  const stats = {
    total: profiles.length,
    known: profiles.filter(d => d.status === 'known').length,
    unknown: profiles.filter(d => d.status === 'unknown').length,
    blocked: blockedMacs.length,
  }

  // ── Loading skeleton ──
  if (loading && profiles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-72 skeleton rounded-lg" />
        <div className="h-4 w-80 skeleton rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4 space-y-2">
              <div className="h-3 w-16 skeleton rounded" /><div className="h-8 w-12 skeleton rounded" />
            </div>
          ))}
        </div>
        <div className="h-12 skeleton rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-4">
              <div className="flex gap-3"><div className="w-10 h-10 skeleton rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 w-32 skeleton rounded" /><div className="h-3 w-20 skeleton rounded" /></div></div>
              <div className="h-3 w-48 skeleton rounded" /><div className="h-9 skeleton rounded-xl" />
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
        <ShieldOff className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load device data</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button onClick={fetchData}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >Retry</button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Cinematic Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950/60 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        {/* Glow orbs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-red-400/20 to-transparent" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/25">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Device Blocking</h1>
              </div>
              <p className="text-sm text-slate-400 mt-1 ml-1">
                Block or unblock devices from accessing your network
              </p>
            </div>
            <button onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
            >
              <Clock className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Summary: Total, Known, Unknown, Blocked */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-blue-500/10"><Monitor className="w-3.5 h-3.5 text-blue-400" /></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Devices</span>
              </div>
              <p className="text-lg font-bold text-white tabular-nums">{stats.total}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-emerald-500/10"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Known</span>
              </div>
              <p className="text-lg font-bold text-emerald-400 tabular-nums">{stats.known}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-amber-500/10"><ShieldAlert className="w-3.5 h-3.5 text-amber-400" /></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Unknown</span>
              </div>
              <p className="text-lg font-bold text-amber-400 tabular-nums">{stats.unknown}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-red-500/10"><Ban className="w-3.5 h-3.5 text-red-400" /></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Blocked</span>
              </div>
              <p className="text-lg font-bold text-red-400 tabular-nums">{stats.blocked}</p>
            </motion.div>
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
        <div className="relative flex-1 min-w-[180px] max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, owner, IP, MAC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Tabs: All, Known, Unknown, Blocked */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-xl p-1 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            const count = tab.id === 'all' ? stats.total
              : tab.id === 'known' ? stats.known
              : tab.id === 'unknown' ? stats.unknown
              : stats.blocked
            const activeStyle = tab.id === 'blocked' ? 'bg-red-500/15 text-red-300 shadow-sm'
              : tab.id === 'unknown' ? 'bg-amber-500/15 text-amber-300 shadow-sm'
              : 'bg-emerald-500/15 text-emerald-300 shadow-sm'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? activeStyle
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={`text-[10px] ml-0.5 ${isActive ? '' : 'text-slate-600'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} device{filtered.length !== 1 ? 's' : ''}
          {orphanMacs.length > 0 && activeTab === 'blocked' && (
            <span className="text-slate-600"> · {orphanMacs.length} orphan</span>
          )}
        </span>
      </motion.div>

      {/* ── Device Grid ── */}
      {filtered.length === 0 && orphanMacs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/5 mb-4">
            {activeTab === 'blocked' ? <ShieldCheck className="w-8 h-8 text-emerald-500/60" />
              : search ? <Search className="w-8 h-8 text-slate-600" />
              : <Monitor className="w-8 h-8 text-slate-600" />}
          </div>
          <p className="text-base font-semibold text-slate-400">
            {activeTab === 'blocked' ? 'No blocked devices'
              : activeTab === 'known' ? 'No known devices'
              : activeTab === 'unknown' ? 'No unknown devices'
              : search ? 'No devices match your search'
              : 'No devices found'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {activeTab === 'blocked' ? 'All devices currently have network access'
              : activeTab === 'known' ? 'No devices have been identified yet'
              : activeTab === 'unknown' ? 'All devices are identified'
              : search ? 'Try adjusting your search terms'
              : 'No device profiles available'}
          </p>
          {(search || activeTab !== 'all') && (
            <button onClick={() => { setSearch(''); setActiveTab('all') }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
            >{activeTab !== 'all' ? 'View all devices' : 'Clear search'}</button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {/* Profile-based devices */}
            {filtered.map((device, idx) => (
              <DeviceBlockCard
                key={device.mac || idx}
                device={device}
                blockedMacs={blockedMacs}
                onBlock={(dev) => setConfirmTarget({ isBlock: true, device: dev })}
                onUnblock={(dev) => setConfirmTarget({ isBlock: false, device: dev })}
              />
            ))}

            {/* Orphan blocked devices (in all or blocked tabs only) */}
            {(activeTab === 'all' || activeTab === 'blocked') && orphanMacs.map((mac, idx) => (
              <OrphanBlockedCard
                key={`orphan-${mac}`}
                mac={mac}
                onUnblock={(m) => setConfirmTarget({ isBlock: false, device: { mac: m } })}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          Blocked devices are denied network access until unblocked · Changes take effect immediately
        </p>
      </motion.div>

      {/* ── Confirmation Dialog ── */}
      {confirmTarget && (
        <ConfirmDialog
          isBlock={confirmTarget.isBlock}
          device={confirmTarget.device}
          onConfirm={confirmTarget.isBlock ? handleBlock : handleUnblock}
          onCancel={() => setConfirmTarget(null)}
          loading={submitting}
        />
      )}
    </div>
  )
}
