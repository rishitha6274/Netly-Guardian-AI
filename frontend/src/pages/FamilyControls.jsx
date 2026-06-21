import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Moon, Ban, Shield, Globe, Gamepad2, MessageCircle,
  Tv, Smartphone, Monitor, Check, X, AlertTriangle,
  User, Wifi, ShieldAlert, ShieldCheck, Activity, Save,
  Loader2, ChevronDown, ChevronRight, Hourglass, Sun,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const COLORS = [
  '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#3b82f6',
]

const colorForOwner = (owner, index) => {
  if (!owner || owner === 'Unknown') return '#64748b'
  return COLORS[index % COLORS.length]
}

const initialsFor = (name) => {
  if (!name || name === 'Unknown') return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const formatMinutes = (m) => {
  if (m == null || m === 0) return '0h'
  if (m < 60) return `${Math.round(m)}m`
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return min > 0 ? `${h}h ${min}m` : `${h}h`
}

const formatTime = (t) => t || '—'

const timeAgo = (ts) => {
  if (!ts) return ''
  const d = new Date(ts.replace(' ', 'T'))
  const now = new Date()
  const s = Math.floor((now - d) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const LIMIT_PRESETS = [
  { label: '30 min', hours: 0.5 },
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '3 hours', hours: 3 },
  { label: '4 hours', hours: 4 },
  { label: '6 hours', hours: 6 },
  { label: 'No limit', hours: 0 },
]

const CURFEW_PRESETS = [
  { label: '8:00 PM', time: '20:00' },
  { label: '9:00 PM', time: '21:00' },
  { label: '10:00 PM', time: '22:00' },
  { label: '11:00 PM', time: '23:00' },
  { label: 'Midnight', time: '00:00' },
  { label: 'No curfew', time: '' },
]

/* =========================================================================
   Stat Card
   ========================================================================= */

function StatCard({ label, value, icon: Icon, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl bg-white/[0.03] border border-white/5 p-4"
    >
      <div className="flex items-start justify-between">
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
   Family Controls Page
   ========================================================================= */

export default function FamilyControls() {
  // ── Data state ──
  const [profiles, setProfiles] = useState([])
  const [alerts, setAlerts] = useState([])
  const [curfewAlerts, setCurfewAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── UI state ──
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [editLimit, setEditLimit] = useState({})
  const [editCurfew, setEditCurfew] = useState({})
  const [saving, setSaving] = useState({})
  const [savedMsg, setSavedMsg] = useState({})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [profRes, alertsRes, curfewRes] = await Promise.all([
        fetch('/api/device-profiles'),
        fetch('/api/alerts'),
        fetch('/api/curfew-alerts'),
      ])
      if (!profRes.ok) throw new Error(`Profiles failed (${profRes.status})`)
      const p = await profRes.json()
      const a = alertsRes.ok ? await alertsRes.json() : []
      const c = curfewRes.ok ? await curfewRes.json() : []
      setProfiles(Array.isArray(p) ? p : [])
      setAlerts(Array.isArray(a) ? a : [])
      setCurfewAlerts(Array.isArray(c) ? c : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load family data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Group profiles by owner ──
  const familyMembers = useMemo(() => {
    const groups = {}
    profiles.forEach(p => {
      const owner = p.owner || 'Unknown'
      if (!groups[owner]) groups[owner] = { name: owner, devices: [], totalMinutes: 0, limits: [], curfews: [] }
      groups[owner].devices.push(p)
      groups[owner].totalMinutes += (p.minutes_online || 0)
      if (p.daily_limit > 0) groups[owner].limits.push(p.daily_limit)
      if (p.curfew_start && p.curfew_end) groups[owner].curfews.push(`${p.curfew_start}-${p.curfew_end}`)
    })
    return Object.values(groups)
  }, [profiles])

  // Set default selected owner
  useEffect(() => {
    if (familyMembers.length > 0 && !selectedOwner) {
      setSelectedOwner(familyMembers[0].name)
    }
  }, [familyMembers, selectedOwner])

  const currentMember = useMemo(
    () => familyMembers.find(m => m.name === selectedOwner),
    [familyMembers, selectedOwner]
  )

  // Stats
  const stats = useMemo(() => ({
    members: familyMembers.length,
    devices: profiles.length,
    screenTimeAlerts: alerts.length,
    curfewAlerts: curfewAlerts.length,
  }), [familyMembers, profiles, alerts, curfewAlerts])

  // ── Save limit ──
  const handleSaveLimit = async (mac, hours) => {
    const limitMinutes = Math.round(hours * 60)
    setSaving(s => ({ ...s, [mac]: 'limit' }))
    try {
      const res = await fetch('/api/set-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac, limit: limitMinutes }),
      })
      if (res.ok) {
        setSavedMsg(s => ({ ...s, [mac]: 'limit' }))
        setTimeout(() => setSavedMsg(s => ({ ...s, [mac]: null })), 2000)
        fetchData()
      }
    } catch { /* ignore */ }
    setSaving(s => ({ ...s, [mac]: null }))
  }

  // ── Save curfew ──
  const handleSaveCurfew = async (mac, start, end) => {
    setSaving(s => ({ ...s, [mac]: 'curfew' }))
    try {
      const res = await fetch('/api/set-curfew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac, start, end }),
      })
      if (res.ok) {
        setSavedMsg(s => ({ ...s, [mac]: 'curfew' }))
        setTimeout(() => setSavedMsg(s => ({ ...s, [mac]: null })), 2000)
        fetchData()
      }
    } catch { /* ignore */ }
    setSaving(s => ({ ...s, [mac]: null }))
  }

  // ── Loading skeleton ──
  if (loading && profiles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 skeleton rounded-lg" />
        <div className="h-4 w-80 skeleton rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4 space-y-2">
              <div className="h-3 w-16 skeleton rounded" /><div className="h-8 w-12 skeleton rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
          <div className="lg:col-span-2 space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 skeleton rounded-2xl" />)}</div>
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
        <p className="text-sm text-red-300 font-medium">Failed to load family controls</p>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-teal-500/10 border border-indigo-500/25">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Family Controls</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                Parental
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 ml-1">
              Manage screen time limits, curfews, and device access for each family member
            </p>
          </div>
          <button onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
          >
            <Clock className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatCard label="Family Members" value={stats.members} icon={User} color="text-indigo-400" bg="bg-indigo-500/10" delay={0.05} />
          <StatCard label="Devices" value={stats.devices} icon={Monitor} color="text-blue-400" bg="bg-blue-500/10" delay={0.1} />
          <StatCard label="Screen Time Alerts" value={stats.screenTimeAlerts} icon={AlertTriangle} color="text-orange-400" bg="bg-orange-500/10" delay={0.15} />
          <StatCard label="Curfew Alerts" value={stats.curfewAlerts} icon={Moon} color="text-indigo-400" bg="bg-indigo-500/10" delay={0.2} />
        </div>
      </motion.div>

      {/* ── Main content: sidebar + panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Family Members Sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-1 space-y-3"
        >
          {familyMembers.length === 0 ? (
            <div className="rounded-xl bg-netly-bg-secondary border border-white/5 p-6 text-center">
              <User className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-500">No family members found</p>
              <p className="text-xs text-slate-600 mt-1">Add devices with owners to get started</p>
            </div>
          ) : (
            familyMembers.map((member, idx) => {
              const isSelected = selectedOwner === member.name
              const color = colorForOwner(member.name, idx)
              const pct = member.devices.length > 0
                ? Math.min(100, (member.totalMinutes / (member.devices[0]?.daily_limit * 60 || 1440)) * 100)
                : 0

              return (
                <motion.button
                  key={member.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOwner(member.name)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-netly-bg-secondary border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {initialsFor(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                      <p className="text-[11px] text-slate-500">{member.devices.length} device{member.devices.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white tabular-nums">{formatMinutes(member.totalMinutes)}</p>
                      <p className="text-[10px] text-slate-600">total</p>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.05 }}
                    />
                  </div>

                  {/* Quick alerts */}
                  {alerts.filter(a => member.devices.some(d => d.name === a.name)).length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-400">
                      <AlertTriangle className="w-3 h-3" />
                      {alerts.filter(a => member.devices.some(d => d.name === a.name)).length} alert
                    </div>
                  )}
                </motion.button>
              )
            })
          )}
        </motion.div>

        {/* ── Controls Panel ── */}
        <motion.div
          key={selectedOwner}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-5"
        >
          {currentMember ? (
            <>
              {/* ── Member Info Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-netly-bg-secondary border border-white/5 p-5"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ backgroundColor: colorForOwner(currentMember.name, familyMembers.indexOf(currentMember)) }}
                  >
                    {initialsFor(currentMember.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-white">{currentMember.name}</h2>
                    <p className="text-xs text-slate-400">{currentMember.devices.length} device{currentMember.devices.length !== 1 ? 's' : ''} · {formatMinutes(currentMember.totalMinutes)} total online</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${currentMember.devices.some(d => d.online) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {currentMember.devices.some(d => d.online) ? 'Online' : 'Offline'}
                  </div>
                </div>

                {/* Device chips */}
                <div className="flex flex-wrap gap-2">
                  {currentMember.devices.map(d => {
                    const isAlerted = alerts.some(a => a.name === d.name)
                    const isCurfewed = curfewAlerts.some(a => a.device === d.name || a.name === d.name)
                    return (
                      <span
                        key={d.mac}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border ${
                          isAlerted
                            ? 'bg-red-500/10 text-red-300 border-red-500/20'
                            : isCurfewed
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        {d.name || 'Unnamed'}
                        {isAlerted && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        {d.blocked && <Ban className="w-3 h-3 text-red-400" />}
                      </span>
                    )
                  })}
                </div>
              </motion.div>

              {/* ── Per-Device Settings ── */}
              {currentMember.devices.map((device, dIdx) => {
                const isSavingLimit = saving[device.mac] === 'limit'
                const isSavingCurfew = saving[device.mac] === 'curfew'
                const limitSaved = savedMsg[device.mac] === 'limit'
                const curfewSaved = savedMsg[device.mac] === 'curfew'
                const hasAlert = alerts.some(a => a.name === device.name)
                const deviceAlert = alerts.find(a => a.name === device.name)
                const usagePct = device.daily_limit > 0
                  ? Math.min(((device.minutes_online || 0) / (device.daily_limit * 60)) * 100, 100)
                  : 0

                return (
                  <motion.div
                    key={device.mac}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dIdx * 0.05 }}
                    className="rounded-xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
                  >
                    {/* Device header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${device.blocked ? 'bg-red-500/15' : device.status === 'known' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                          <Monitor className={`w-4 h-4 ${device.blocked ? 'text-red-400' : device.status === 'known' ? 'text-emerald-400' : 'text-amber-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{device.name || 'Unnamed'}</p>
                          <p className="text-[10px] font-mono text-slate-600">{device.mac}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasAlert && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-[10px] text-red-300 border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Limit exceeded
                          </span>
                        )}
                        {device.blocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-[10px] text-red-300 border border-red-500/30">
                            <Ban className="w-3 h-3" />
                            Blocked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Usage row */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            Screen time
                          </span>
                          <span className="text-white font-mono font-semibold tabular-nums">
                            {formatMinutes(device.minutes_online)}
                            {device.daily_limit > 0 && (
                              <span className="text-slate-500 font-normal"> / {formatMinutes(device.daily_limit * 60)}</span>
                            )}
                          </span>
                        </div>
                        {device.daily_limit > 0 && (
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${usagePct}%` }}
                              transition={{ duration: 1, delay: dIdx * 0.05 }}
                              className={`h-full rounded-full ${
                                usagePct >= 100 ? 'bg-red-500' : usagePct >= 80 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Alert message */}
                      {deviceAlert && (
                        <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
                          <p className="text-[11px] text-red-200/80">{deviceAlert.message}</p>
                        </div>
                      )}

                      {/* Daily limit presets */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <Hourglass className="w-3.5 h-3.5 text-orange-400" />
                            Daily Limit
                          </span>
                          <div className="flex items-center gap-2">
                            {isSavingLimit && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                            {limitSaved && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {LIMIT_PRESETS.map(preset => {
                            const isActive = device.daily_limit === Math.round(preset.hours * 60)
                            return (
                              <button
                                key={preset.label}
                                onClick={() => {
                                  if (preset.hours === 0) {
                                    handleSaveLimit(device.mac, 0)
                                  } else {
                                    handleSaveLimit(device.mac, preset.hours)
                                  }
                                }}
                                disabled={isSavingLimit}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                                  isActive
                                    ? preset.hours === 0
                                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                      : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                                    : 'bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
                                }`}
                              >
                                {preset.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Curfew presets */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                            Curfew
                          </span>
                          <div className="flex items-center gap-2">
                            {isSavingCurfew && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                            {curfewSaved && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {CURFEW_PRESETS.map(preset => {
                            const isActive = device.curfew_start === preset.time ||
                              (preset.time === '' && (!device.curfew_start || device.curfew_start === ''))
                            return (
                              <button
                                key={preset.label}
                                onClick={() => {
                                  if (preset.time === '') {
                                    handleSaveCurfew(device.mac, '', '')
                                  } else {
                                    // Default curfew end is 6:00 AM next day
                                    handleSaveCurfew(device.mac, preset.time, '06:00')
                                  }
                                }}
                                disabled={isSavingCurfew}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                                  isActive
                                    ? preset.time === ''
                                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                    : 'bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
                                }`}
                              >
                                <Moon className="w-3 h-3" />
                                {preset.label}
                              </button>
                            )
                          })}
                        </div>
                        {device.curfew_start && device.curfew_end && device.curfew_start !== '' && (
                          <p className="text-[10px] text-indigo-300/60 mt-1.5">
                            Current: {device.curfew_start} – {device.curfew_end}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* ── Summary footer ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl bg-white/[0.02] border border-white/5 p-4"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {currentMember.name} — {currentMember.devices.length} device{currentMember.devices.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                      {currentMember.devices.filter(d => d.online).length} online
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {currentMember.devices.filter(d => d.blocked).length} blocked
                    </span>
                  </span>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="rounded-xl bg-netly-bg-secondary border border-white/5 p-12 flex flex-col items-center justify-center text-center">
              <Shield className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-base font-semibold text-white mb-2">Select a Family Member</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Choose a family member from the sidebar to manage their screen time limits, curfews, and device access
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          Changes are applied in real-time · Limits and curfews are enforced by the monitoring engine
        </p>
      </motion.div>
    </div>
  )
}
