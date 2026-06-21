import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor, Wifi, ShieldCheck, ShieldAlert, Activity,
  Smartphone, Laptop, Tablet, Tv, Radio, HelpCircle,
  Clock, TrendingUp, TrendingDown, ExternalLink,
  Wifi as WifiIcon, WifiOff, EyeOff, Shield, Zap,
  CheckCircle, XCircle, Ban, Settings, Pencil, Hourglass,
  Search, ChevronDown, AlertTriangle, Bell,
} from 'lucide-react'
import DashboardAlertPanel from '../components/DashboardAlertPanel'
import TrustDeviceModal from '../components/TrustDeviceModal'
import DeviceEditModal from '../components/DeviceEditModal'
import { useNetlyData } from '../data/useNetlyData'

/* =========================================================================
   Security Score Card
   ========================================================================= */

const SecurityScoreCard = ({ stats }) => {
  // Build score data from stats (which includes securityScore from the hook)
  const score = stats.securityScore ?? 0
  const level = score >= 80 ? 'Excellent'
              : score >= 60 ? 'Good'
              : score >= 40 ? 'Fair'
              : 'Poor'

  const color = score >= 80 ? '#22c55e'
              : score >= 60 ? '#3b82f6'
              : score >= 40 ? '#f97316'
              : '#ef4444'

  const labelColor = score >= 80 ? 'text-emerald-400'
                   : score >= 60 ? 'text-blue-400'
                   : score >= 40 ? 'text-orange-400'
                   : 'text-red-400'

  const bgColor = score >= 80 ? 'from-emerald-500/20 to-emerald-600/5'
                : score >= 60 ? 'from-blue-500/20 to-blue-600/5'
                : score >= 40 ? 'from-orange-500/20 to-orange-600/5'
                : 'from-red-500/20 to-red-600/5'

  const borderColor = score >= 80 ? 'border-emerald-500/30'
                    : score >= 60 ? 'border-blue-500/30'
                    : score >= 40 ? 'border-orange-500/30'
                    : 'border-red-500/30'

  const iconBg = score >= 80 ? 'bg-emerald-500/15'
               : score >= 60 ? 'bg-blue-500/15'
               : score >= 40 ? 'bg-orange-500/15'
               : 'bg-red-500/15'

  // SVG circle progress
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.32 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`card-shine relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${bgColor} border ${borderColor} hex-pattern`}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24">
        <div className="absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 right-0 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-28 h-28 opacity-[0.06] bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${iconBg} relative`}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <Shield className={`w-5 h-5 ${labelColor} relative z-10`} />
          </div>
        </div>

        {/* Circular progress */}
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" className="-rotate-90">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <motion.circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className={`text-3xl font-bold ${labelColor}`}
              >
                {score}
              </motion.span>
              <span className="text-[10px] text-slate-500 mt-0.5">/ 100</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className={`text-sm font-semibold ${labelColor}`}>
              {level}
            </p>
            <p className="text-xs text-slate-400">Security Score</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {stats.unknownCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-[10px] text-amber-300 border border-amber-500/20">
                  <ShieldAlert className="w-3 h-3" />
                  {stats.unknownCount} unknown
                </span>
              )}
              {stats.unreadAlerts > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 text-[10px] text-red-300 border border-red-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.unreadAlerts} alerts
                </span>
              )}
            </div>
            {stats.openPorts && stats.openPorts.length > 0 && (
              <p className="text-[10px] text-slate-500">
                {stats.openPorts.length} open port{stats.openPorts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Helpers
   ========================================================================= */

const formatTimeAgo = (ts) => {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const formatTime = (ts) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const DeviceIcon = ({ type, className = 'w-5 h-5' }) => {
  const map = { phone: Smartphone, laptop: Laptop, tablet: Tablet, tv: Tv, iot: Radio, router: Wifi }
  const Icon = map[type] || HelpCircle
  return <Icon className={className} />
}

/* =========================================================================
   Collapsible Section Wrapper
   ========================================================================= */

const CollapsibleSection = ({ title, icon: Icon, count, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-1 py-2 group"
      >
        {Icon && <Icon className="w-5 h-5 text-blue-400" />}
        <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
          {title}
        </h3>
        {count != null && (
          <span className="text-xs font-normal text-slate-500 ml-0.5">({count})</span>
        )}
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  )
}

/* =========================================================================
   1. Overview Cards
   ========================================================================= */

const OverviewCards = ({ stats }) => {
  const cards = [
    {
      icon: Wifi,
      label: 'Total Devices',
      value: stats.totalDevices,
      sub: `${stats.knownCount} known`,
      trend: 'neutral',
      color: 'from-blue-500/20 to-blue-600/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      icon: ShieldCheck,
      label: 'Known Devices',
      value: stats.knownCount,
      sub: `${stats.unknownCount} unknown`,
      trend: 'good',
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
    {
      icon: ShieldAlert,
      label: 'Unknown Devices',
      value: stats.unknownCount,
      sub: stats.unknownCount === 0 ? 'All identified' : 'Needs review',
      trend: stats.unknownCount === 0 ? 'good' : 'bad',
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
      trend: 'neutral',
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
          {/* Animated corner accent */}
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
              {card.trend === 'good' && <TrendingDown className="w-4 h-4 text-emerald-400" />}
              {card.trend === 'bad' && <TrendingUp className="w-4 h-4 text-red-400" />}
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
   2. Device Table
   ========================================================================= */

const StatusBadge = ({ status }) => {
  if (status === 'unknown') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <ShieldAlert className="w-3 h-3" /> Unknown
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <ShieldCheck className="w-3 h-3" /> Known
    </span>
  )
}

const DeviceTable = ({ devices, onTrust, onEdit }) => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(true)

  const filtered = devices.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(d.name || '').toLowerCase().includes(q)
        || String(d.ip || '').includes(q)
        || String(d.mac || '').toLowerCase().includes(q)
        || String(d.vendor || '').toLowerCase().includes(q)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden scan-line relative"
    >
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Network Devices</h3>
          <span className="text-xs font-normal text-slate-500 ml-1">({devices.length})</span>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {open && (
          <div>
            {/* Search bar */}
            <div className="px-5 py-3 border-b border-white/5">
              <input
                type="text"
                placeholder="Search devices…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">MAC</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-500">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No devices found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d, idx) => (
                      <motion.tr
                        key={d.mac || d.ip || idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${d.status === 'unknown' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                              <DeviceIcon type={d.type} className={`w-4 h-4 ${d.status === 'unknown' ? 'text-amber-400' : 'text-blue-400'}`} />
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">{d.name || 'Unnamed'}</p>
                              <p className="text-[11px] text-slate-500">{d.vendor || 'Unknown vendor'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{d.ip || '—'}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{d.mac || '—'}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={d.status || 'unknown'} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.status === 'unknown' ? (
                              <button
                                title="Trust Device"
                                onClick={() => onTrust?.(d)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-xs font-semibold"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Trust
                              </button>
                            ) : (
                              <button
                                title="Edit Device"
                                onClick={() => onEdit?.(d)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-xs font-semibold"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 group-hover:hidden">
                            <span className="text-xs text-slate-600">···</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 text-xs text-slate-500">
              <span>{filtered.length} of {devices.length} devices</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  {devices.filter(d => d.status === 'known').length} known
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  {devices.filter(d => d.status === 'unknown').length} unknown
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* =========================================================================
   3. Usage Section
   ========================================================================= */

const UsageSection = ({ devices }) => {
  const [open, setOpen] = useState(true)
  const sorted = [...devices].sort((a, b) => (b.minutesOnline || 0) - (a.minutesOnline || 0))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl bg-netly-bg-secondary border border-white/5 hex-pattern"
    >
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Device Usage</h3>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {open && (
          <div className="p-5 space-y-4">
            {sorted.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No usage data available</p>
            ) : (
              sorted.map((d, idx) => {
                const maxMinutes = Math.max(...sorted.map(x => x.minutesOnline || 0), 1)
                const pct = Math.min(((d.minutesOnline || 0) / maxMinutes) * 100, 100)

                const limit = d.screenTimeLimit
                const usage = d.minutesOnline || 0
                const exceeded = limit != null && usage > limit

                return (
                  <motion.div
                    key={d.mac || d.ip || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group"
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className={`p-1.5 rounded-lg ${d.status === 'unknown' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                        <DeviceIcon type={d.type} className={`w-3.5 h-3.5 ${d.status === 'unknown' ? 'text-amber-400' : 'text-blue-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-medium truncate">{d.name}</p>
                            {exceeded && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                Limit
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 ml-2 tabular-nums">
                            {usage} min
                            {limit != null && <span className="text-slate-600"> / {limit}</span>}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.03, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          exceeded
                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                            : d.status === 'unknown'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                              : 'bg-gradient-to-r from-blue-500 to-blue-400'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[11px] text-slate-600">
                        Last seen: {d.lastSeen ? formatTimeAgo(d.lastSeen) : '—'}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* =========================================================================
   4. Alerts Section — uses DashboardAlertPanel
   ========================================================================= */

/* =========================================================================
   5. Activity Timeline
   ========================================================================= */

const EventIcon = ({ type }) => {
  if (type === 'join') return <WifiIcon className="w-4 h-4 text-emerald-400" />
  if (type === 'leave') return <WifiOff className="w-4 h-4 text-slate-400" />
  return <Activity className="w-4 h-4 text-amber-400" />
}

const ActivityTimeline = ({ events }) => {
  const [open, setOpen] = useState(true)

  const normalised = events.map((e, i) => {
    const type = e.event === 'device_joined' ? 'join'
               : e.event === 'device_left'  ? 'leave'
               : e.type || 'info'
    const label = type === 'join' ? 'Device Joined'
                : type === 'leave' ? 'Device Left'
                : e.label || 'Event'
    const ts = e.timestamp || e.time || null
    return { ...e, type, label, _ts: ts, _sort: new Date(ts).getTime() || i }
  })
    .sort((a, b) => b._sort - a._sort)
    .slice(0, 20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-netly-bg-secondary border border-white/5 data-flow"
    >
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Activity Timeline</h3>
          <span className="text-xs font-normal text-slate-500 ml-1">({events.length} events)</span>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {open && (
          <div className="p-5">
            <div className="relative">
              <div className="absolute left-[17px] top-2 bottom-2 w-px bg-white/5" />
              <div className="space-y-0">
                {normalised.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No events recorded</p>
                ) : (
                  normalised.map((e, idx) => (
                    <motion.div
                      key={e.id || `evt-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.015 }}
                      className="flex items-start gap-4 py-2.5 group"
                    >
                      <div className={`relative z-10 p-2 rounded-lg flex-shrink-0 ${
                        e.type === 'join'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : e.type === 'leave'
                          ? 'bg-slate-500/10 border border-slate-500/20'
                          : 'bg-amber-500/10 border border-amber-500/20'
                      }`}>
                        <EventIcon type={e.type} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${
                            e.type === 'join' ? 'text-emerald-300' : e.type === 'leave' ? 'text-slate-300' : 'text-amber-300'
                          }`}>
                            {e.label}
                          </span>
                          {e.device && (
                            <span className="text-xs text-slate-400">{e.device}</span>
                          )}
                        </div>
                        {e.desc && (
                          <p className="text-xs text-slate-500 mt-0.5">{e.desc}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 pt-1">
                        <span className="text-[11px] font-mono text-slate-600">{formatTime(e._ts)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* =========================================================================
   Dashboard Page
   ========================================================================= */

export default function Dashboard() {
  const { devices, alerts, events, stats, loading, error, refresh } = useNetlyData()
  const [trustTarget, setTrustTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [notifCount, setNotifCount] = useState(null)
  const unknownDevices = devices.filter(d => d.status === 'unknown')

  // Fetch notifications count
  useEffect(() => {
    fetch('/api/notifications').then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) setNotifCount(data.length)
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3 glitch-text" data-text="Netly Guardian">
              Netly Guardian
              <span className="text-xs font-normal bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">AI</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${loading ? 'glow-pulse-blue' : 'bg-emerald-400'}`} />
              <span className="text-slate-500 font-mono text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-slate-600 mx-1">·</span>
              <span>{devices.length} devices</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">{stats.knownCount} known</span>
              <span className="text-slate-600">·</span>
              <span className={`${stats.unknownCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{stats.unknownCount} unknown</span>
              <span className="text-slate-600">·</span>
              <span className="text-violet-400">{stats.recentEvents} events</span>
              {error && (
                <span className="text-xs text-red-400 ml-2">· API error: {error}</span>
              )}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              <span className="text-xs text-blue-300 font-medium">Live</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 1. Overview Cards ── */}
      <OverviewCards stats={stats} />

      {/* ── Security Score Card ── */}
      <SecurityScoreCard stats={stats} />

      {/* ── Quick Security Summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Security Level', value: stats.securityLevel || (stats.securityScore >= 80 ? 'Excellent' : stats.securityScore >= 60 ? 'Good' : stats.securityScore >= 40 ? 'Fair' : 'Poor'), icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Threats Blocked', value: stats.threatsBlockedThisWeek ?? 0, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Unread Alerts', value: stats.unreadAlerts ?? 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Notifications', value: notifCount ?? stats.criticalAlerts ?? 0, icon: Bell, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 + i * 0.06 }}
            className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-white tabular-nums">{item.value}</p>
              <p className="text-[10px] text-slate-500">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── 2. Device Table ── */}
      <DeviceTable devices={devices} onTrust={setTrustTarget} onEdit={setEditTarget} />

      {/* ── 3+4. Usage + Alerts (two-column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageSection devices={devices} />
        <DashboardAlertPanel alerts={alerts} />
      </div>

      {/* ── 5. Activity Timeline ── */}
      <ActivityTimeline events={events} />

      {/* ── Trust Device Modal ── */}
      {trustTarget && (
        <TrustDeviceModal
          device={trustTarget}
          onClose={() => setTrustTarget(null)}
          onSuccess={refresh}
        />
      )}

      {/* ── Device Edit Modal ── */}
      {editTarget && (
        <DeviceEditModal
          device={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={refresh}
        />
      )}

      {/* ── Loading overlay on first load ── */}
      {loading && devices.length === 0 && (
        <div className="fixed inset-0 bg-netly-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-blue-500/30 border-t-blue-400"
            />
            <p className="text-sm text-slate-400">Connecting to network…</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pt-6 pb-2 border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
          <span>Netly Guardian</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>Home Network Security</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="font-mono">v1.0</span>
        </div>
      </footer>
    </div>
  )
}
