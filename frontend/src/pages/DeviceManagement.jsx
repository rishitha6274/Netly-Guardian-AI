import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Smartphone, Laptop, Tablet, Tv, Radio, HelpCircle,
  Search, Pencil, Clock, Moon, Save, User,
  X, Loader2, CheckCircle, AlertTriangle, Timer, Wifi,
  Shield, ShieldCheck, ShieldAlert, Activity, Zap,
  TrendingUp, FileText, Ban,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'
import Notification from '../components/Notification'
import NoteModal from '../components/NoteModal'
import TrustDeviceModal from '../components/TrustDeviceModal'

/* =========================================================================
   Helpers
   ========================================================================= */

const DeviceIcon = ({ type, className = 'w-5 h-5' }) => {
  const map = { phone: Smartphone, laptop: Laptop, tablet: Tablet, tv: Tv, iot: Radio, router: Wifi }
  const Icon = map[type] || HelpCircle
  return <Icon className={className} />
}

const formatUsage = (minutes) => {
  if (minutes == null || minutes === 0) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const formatTimeAgo = (ts) => {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

/* ─── Sun icon (inline SVG) ──────────────────────────────────────────── */
function Sun({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

/* =========================================================================
   1. Dashboard Statistics Cards
   ========================================================================= */

function StatsCards({ stats }) {
  const cards = [
    {
      icon: Wifi,
      label: 'Total Devices',
      value: stats.totalDevices,
      sub: `${stats.knownCount} known · ${stats.unknownCount} unknown`,
      color: 'from-blue-500/20 to-blue-600/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      icon: ShieldCheck,
      label: 'Known Devices',
      value: stats.knownCount,
      sub: `${stats.unknownCount} unidentified`,
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
    {
      icon: ShieldAlert,
      label: 'Unknown Devices',
      value: stats.unknownCount,
      sub: stats.unknownCount === 0 ? 'All identified' : 'Needs review',
      color: stats.unknownCount === 0
        ? 'from-emerald-500/20 to-emerald-600/5'
        : 'from-amber-500/20 to-amber-600/5',
      iconBg: stats.unknownCount === 0 ? 'bg-emerald-500/15' : 'bg-amber-500/15',
      iconColor: stats.unknownCount === 0 ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      icon: Activity,
      label: 'Recent Events',
      value: stats.recentEvents,
      sub: 'Last 24 hours',
      color: 'from-violet-500/20 to-violet-600/5',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`card-shine relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${card.color} border border-white/5 hex-pattern`}
        >
          <div className="absolute top-0 right-0 w-24 h-24">
            <div className="absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
            <div className="absolute top-0 right-0 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-28 h-28 opacity-[0.06] bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg} relative`}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                <card.icon className={`w-5 h-5 ${card.iconColor} relative z-10`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">{card.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* =========================================================================
   2. Usage Monitoring Cards
   ========================================================================= */

function UsageMonitoringCards({ devices }) {
  const totalMinutes = devices.reduce((sum, d) => sum + (d.minutesOnline || 0), 0)
  const mostUsed = [...devices].sort((a, b) => (b.minutesOnline || 0) - (a.minutesOnline || 0))[0]
  const overLimit = devices.filter(d => d.screenTimeLimit != null && (d.minutesOnline || 0) > d.screenTimeLimit).length

  const cards = [
    {
      icon: Clock,
      label: 'Total Usage',
      value: formatUsage(totalMinutes),
      sub: `Across ${devices.length} devices`,
      color: 'from-blue-500/20 to-indigo-600/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Most Used',
      value: mostUsed?.name || '—',
      sub: mostUsed ? `${formatUsage(mostUsed.minutesOnline || 0)} today` : 'No data',
      color: 'from-violet-500/20 to-purple-600/5',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
    },
    {
      icon: Ban,
      label: 'Over Limit',
      value: overLimit,
      sub: overLimit === 1 ? '1 device exceeded' : `${overLimit} devices exceeded`,
      color: overLimit === 0
        ? 'from-emerald-500/20 to-emerald-600/5'
        : 'from-red-500/20 to-red-600/5',
      iconBg: overLimit === 0 ? 'bg-emerald-500/15' : 'bg-red-500/15',
      iconColor: overLimit === 0 ? 'text-emerald-400' : 'text-red-400',
    },
  ]

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-400" />
        Usage Monitoring
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${card.color} border border-white/5`}
          >
            <div className="relative z-10 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-base font-bold text-white truncate mt-0.5">{card.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   3. Security Alerts Panel
   ========================================================================= */

function SecurityAlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 text-center"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-emerald-300">No Active Security Alerts</p>
        <p className="text-xs text-slate-500 mt-0.5">All devices are behaving normally</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        Security Alerts
        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/25">
          {alerts.length}
        </span>
      </h3>
      {alerts.slice(0, 5).map((alert, idx) => (
        <motion.div
          key={alert.id || alert.mac || idx}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-3.5"
        >
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">{alert.name || 'Device'}</p>
              <p className="text-[11px] text-red-200/80 mt-0.5">{alert.message || ''}</p>
              {alert.usage != null && alert.limit != null && (
                <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                  <span className="text-red-300">{alert.usage} / {alert.limit} mins</span>
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden max-w-24">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
                      style={{ width: `${Math.min((alert.usage / alert.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {alerts.length > 5 && (
        <p className="text-[11px] text-slate-500 text-center">+{alerts.length - 5} more alerts</p>
      )}
    </div>
  )
}

/* =========================================================================
   4. Curfew Alerts Panel
   ========================================================================= */

function CurfewAlertsPanel({ devices }) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Simulate curfew status: flag devices that would be in curfew based on a pattern
  const curfewDevices = devices.filter(d => {
    // For demo: flag devices with screenTimeLimit < 60 as "in curfew" between 10pm-6am
    if (!d.screenTimeLimit || d.screenTimeLimit < 60) return false
    return (currentMinutes < 360 || currentMinutes >= 1320) // 6am or 10pm
  })

  if (curfewDevices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-5 text-center"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 mb-2">
          <Moon className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-blue-300">No Active Curfews</p>
        <p className="text-xs text-slate-500 mt-0.5">All devices are outside curfew hours</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Moon className="w-3.5 h-3.5 text-blue-400" />
        Curfew Alerts
        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/25">
          {curfewDevices.length}
        </span>
      </h3>
      {curfewDevices.slice(0, 5).map((d, idx) => (
        <motion.div
          key={d.mac || idx}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-3.5"
        >
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex-shrink-0">
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">{d.name}</p>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                Curfew active · Limit: {formatUsage(d.screenTimeLimit)}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-blue-300">
                <Clock className="w-3 h-3" />
                <span>Started 21:00 · Ends 07:00</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* =========================================================================
   5. Action Modal — Rename / Set Limit / Set Curfew
   ========================================================================= */

const ACTION_TABS = [
  { id: 'rename', label: 'Rename', icon: Pencil },
  { id: 'limit', label: 'Screen Time', icon: Timer },
  { id: 'curfew', label: 'Curfew', icon: Moon },
]

function DeviceActionModal({ device, onClose, onSuccess, onNotify }) {
  const [activeTab, setActiveTab] = useState('rename')
  const [name, setName] = useState(device?.name || '')
  const [limitMinutes, setLimitMinutes] = useState(device?.screenTimeLimit || 60)
  const [curfewStart, setCurfewStart] = useState('21:00')
  const [curfewEnd, setCurfewEnd] = useState('07:00')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (activeTab === 'rename') {
        const res = await fetch('/api/rename-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), mac: device.mac }),
        })
        if (!res.ok) throw new Error(`Rename failed (${res.status})`)
        setSuccessMsg(`Renamed to "${name.trim()}"`)
        onNotify?.(`Device renamed to "${name.trim()}"`)

      } else if (activeTab === 'limit') {
        const res = await fetch('/api/set-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mac: device.mac,
            limit_minutes: parseInt(limitMinutes, 10) || 0,
          }),
        })
        if (!res.ok) throw new Error(`Set limit failed (${res.status})`)
        setSuccessMsg(`Limit set to ${limitMinutes} min/day`)
        onNotify?.(`Screen time limit set to ${limitMinutes} minutes for ${device.name}`)

      } else if (activeTab === 'curfew') {
        const res = await fetch('/api/set-curfew', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mac: device.mac,
            curfew_start: curfewStart,
            curfew_end: curfewEnd,
          }),
        })
        if (!res.ok) throw new Error(`Set curfew failed (${res.status})`)
        setSuccessMsg(`Curfew ${curfewStart} → ${curfewEnd}`)
        onNotify?.(`Curfew set for ${device.name}: ${curfewStart} → ${curfewEnd}`)
      }

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const tabContent = () => {
    switch (activeTab) {
      case 'rename':
        return (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">New Device Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rishitha's Phone"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        )
      case 'limit':
        return (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Screen Time Limit (minutes)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={1440}
                value={limitMinutes}
                onChange={e => setLimitMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
              <span className="text-xs text-slate-500 flex-shrink-0">mins/day</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {[30, 60, 120, 180, 300].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLimitMinutes(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    parseInt(limitMinutes) === v
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {v >= 60 ? `${v / 60}h` : `${v}m`}
                </button>
              ))}
            </div>
          </div>
        )
      case 'curfew':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Curfew Start Time</label>
              <div className="relative">
                <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  value={curfewStart}
                  onChange={e => setCurfewStart(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all [color-scheme:dark]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">Devices will be locked starting at this time</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Curfew End Time</label>
              <div className="relative">
                <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  value={curfewEnd}
                  onChange={e => setCurfewEnd(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all [color-scheme:dark]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">Devices will be unlocked after this time</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-300 font-medium">Curfew Period</p>
                <p className="text-[11px] text-blue-400/70 mt-0.5">
                  {curfewStart} → {curfewEnd}
                  {curfewStart > curfewEnd ? ' (overnight)' : curfewStart === curfewEnd ? ' (full day)' : ''}
                </p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const canSubmit = (activeTab === 'rename' && name.trim())
    || (activeTab === 'limit')
    || (activeTab === 'curfew')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-2xl bg-netly-bg-secondary border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
                  <Pencil className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Manage Device</h2>
                  <p className="text-xs text-slate-400">{device?.name} · {device?.mac}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="border-t border-white/5" />
            <div className="flex border-b border-white/5">
              {ACTION_TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors relative ${
                      isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div layoutId="action-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="px-6 py-5">
              {successMsg ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">Updated!</p>
                  <p className="text-sm text-slate-400 mt-1">{successMsg}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">MAC Address</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="font-mono text-sm text-slate-300">{device?.mac || '—'}</span>
                      <span className="text-[10px] text-slate-600 ml-auto">read-only</span>
                    </div>
                  </div>
                  {tabContent()}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">{error}</p>
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={submitting}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting || !canSubmit}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/* =========================================================================
   6. Device Card (includes Notes section)
   ========================================================================= */

function DeviceCard({ device, onManage, onTrust, onNote, notesMap, idx }) {
  const limit = device.screenTimeLimit
  const usage = device.minutesOnline || 0
  const pct = limit && limit > 0 ? Math.min((usage / limit) * 100, 100) : 0
  const exceeded = limit != null && usage > limit
  const macKey = device.mac ? device.mac.toLowerCase() : ''
  const deviceNote = notesMap?.[macKey] || ''
  const hasNote = !!deviceNote

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.04 }}
      whileHover={{ y: -3 }}
      className="relative group rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              device.status === 'unknown' ? 'bg-amber-500/10' : 'bg-blue-500/10'
            }`}>
              <DeviceIcon type={device.type} className={`w-5 h-5 ${
                device.status === 'unknown' ? 'text-amber-400' : 'text-blue-400'
              }`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{device.name || 'Unnamed'}</h3>
              {device.owner && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3" />
                  {device.owner}
                </p>
              )}
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            device.status === 'known'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            {device.status === 'known' ? 'Known' : 'Unknown'}
          </span>
        </div>

        {/* MAC + IP + Vendor */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-mono w-8">MAC</span>
            <span className="font-mono text-slate-400">{device.mac || '—'}</span>
          </div>
          {device.ip && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-mono w-8">IP</span>
              <span className="font-mono text-slate-500">{device.ip}</span>
            </div>
          )}
          {device.vendor && device.vendor !== 'Unknown' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-mono w-8">Vendor</span>
              <span className="text-slate-500">{device.vendor}</span>
            </div>
          )}
        </div>

        {/* Usage bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Usage
            </span>
            <span className={`font-medium tabular-nums ${exceeded ? 'text-red-400' : 'text-slate-300'}`}>
              {formatUsage(usage)}
              {limit != null && <span className="text-slate-600"> / {formatUsage(limit)}</span>}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                exceeded ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
            />
          </div>
          {exceeded && (
            <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Exceeded limit
            </p>
          )}
        </div>

        {/* Notes section */}
        <div className="mb-3">
          <button
            onClick={() => onNote?.(device, deviceNote)}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors w-full group"
          >
            {hasNote ? (
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full" />
              </div>
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
            {hasNote && (
              <span className="text-[10px] text-slate-600 ml-auto truncate max-w-[140px] group-hover:text-slate-400 transition-colors">
                {deviceNote}
              </span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {device.status === 'unknown' ? (
            <button
              onClick={() => onTrust(device)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-sm font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              Trust
            </button>
          ) : (
            <button
              onClick={() => onManage(device)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-400 hover:from-blue-500/20 hover:to-blue-500/10 hover:border-blue-500/40 transition-all text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Manage
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Device Management Page
   ========================================================================= */

export default function DeviceManagement() {
  const { devices, alerts, stats, loading, refresh } = useNetlyData()
  const [search, setSearch] = useState('')
  const [manageTarget, setManageTarget] = useState(null)
  const [trustTarget, setTrustTarget] = useState(null)
  const [notif, setNotif] = useState({ message: '', visible: false })
  const [notesMap, setNotesMap] = useState({})
  const [noteTarget, setNoteTarget] = useState(null)

  const showNotification = useCallback((message) => {
    setNotif({ message, visible: true })
  }, [])

  const hideNotification = useCallback(() => {
    setNotif(prev => ({ ...prev, visible: false }))
  }, [])

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes')
      if (res.ok) {
        const data = await res.json()
        // Normalise: backend returns object keyed by MAC (lowercase)
        const normalised = {}
        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([mac, note]) => {
            normalised[mac.toLowerCase()] = typeof note === 'string' ? note : (note.note || note.content || JSON.stringify(note))
          })
        }
        setNotesMap(normalised)
      }
    } catch {
      // silently fail — notes are non-critical
    }
  }, [])

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const filtered = devices.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(d.name || '').toLowerCase().includes(q)
        || String(d.owner || '').toLowerCase().includes(q)
        || String(d.mac || '').toLowerCase().includes(q)
  })

  const knownDevices = filtered.filter(d => d.status === 'known')
  const unknownDevices = filtered.filter(d => d.status === 'unknown')

  return (
    <div className="space-y-6">
      {/* Notification */}
      <Notification message={notif.message} visible={notif.visible} onClose={hideNotification} />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Monitor className="w-6 h-6 text-blue-400" />
          Device Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor usage, manage limits, set curfews, and track devices across your network
        </p>
      </motion.div>

      {/* ── 1. Dashboard Statistics Cards ── */}
      <StatsCards stats={stats} />

      {/* ── 2. Usage Monitoring Cards ── */}
      <UsageMonitoringCards devices={devices} />

      {/* ── 3+4. Security Alerts + Curfew Alerts (two-column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-4"
        >
          <SecurityAlertsPanel alerts={alerts} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-4"
        >
          <CurfewAlertsPanel devices={devices} />
        </motion.div>
      </div>

      {/* ── Search + Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search devices…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            {knownDevices.length} known
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            {unknownDevices.length} unknown
          </span>
          <span className="text-slate-600">·</span>
          <span>{filtered.length} total</span>
        </div>
      </motion.div>

      {/* ── Device Grid ── */}
      {loading && devices.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="space-y-2 flex-1"><div className="h-3 w-24 skeleton rounded" /><div className="h-2 w-16 skeleton rounded" /></div>
              </div>
              <div className="space-y-2"><div className="h-2 skeleton rounded" /><div className="h-2 skeleton rounded w-3/4" /></div>
              <div className="h-1.5 skeleton rounded-full" /><div className="h-9 skeleton rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-500">No devices match your search</p>
        </motion.div>
      ) : (
        <>
          {knownDevices.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Known Devices <span className="text-xs font-normal text-slate-600">({knownDevices.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {knownDevices.map((d, idx) => (
                  <DeviceCard key={d.mac || d.ip || idx} device={d} idx={idx} onManage={setManageTarget} onTrust={setTrustTarget} onNote={(dev, note) => setNoteTarget({ device: dev, note })} notesMap={notesMap} />
                ))}
              </div>
            </div>
          )}
          {unknownDevices.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                Unknown Devices <span className="text-xs font-normal text-slate-600">({unknownDevices.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {unknownDevices.map((d, idx) => (
                  <DeviceCard key={d.mac || d.ip || idx} device={d} idx={idx} onManage={setManageTarget} onTrust={setTrustTarget} onNote={(dev, note) => setNoteTarget({ device: dev, note })} notesMap={notesMap} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Action Modal ── */}
      {manageTarget && (
        <DeviceActionModal
          device={manageTarget}
          onClose={() => setManageTarget(null)}
          onSuccess={refresh}
          onNotify={showNotification}
        />
      )}

      {/* ── Note Modal ── */}
      {noteTarget && (
        <NoteModal
          device={noteTarget.device}
          existingNote={noteTarget.note}
          onClose={() => setNoteTarget(null)}
          onSuccess={() => {
            fetchNotes()
            refresh()
          }}
        />
      )}

      {/* ── Trust Device Modal ── */}
      {trustTarget && (
        <TrustDeviceModal
          device={trustTarget}
          onClose={() => setTrustTarget(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  )
}
