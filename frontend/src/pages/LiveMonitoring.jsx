import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Wifi, WifiOff, AlertTriangle, Clock,
  Shield, RefreshCw, Radio, Dot,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

/* ─── Event Icon ──────────────────────────────────────────────────────── */

const EventIcon = ({ type }) => {
  const map = {
    join:    { icon: Wifi,       bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: 'text-emerald-400' },
    leave:   { icon: WifiOff,    bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   color: 'text-slate-400' },
    unknown: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', color: 'text-amber-400' },
  }
  const s = map[type] || map.unknown
  const Icon = s.icon
  return (
    <div className={`p-2 rounded-lg ${s.bg} border ${s.border} flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${s.color}`} />
    </div>
  )
}

/* ─── Recent Events ───────────────────────────────────────────────────── */

const RecentEvents = ({ events }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5"
  >
    <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
      <Activity className="w-5 h-5 text-teal-400" />
      Recent Events
      <span className="ml-auto text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
        Live
      </span>
    </h3>

    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[21px] top-3 bottom-3 w-px bg-white/5" />

      <div className="space-y-0">
        {events.map((evt, idx) => (
          <motion.div
            key={`${evt.time}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + idx * 0.08 }}
            className="flex items-start gap-4 pb-5 last:pb-0 relative"
          >
            {/* Dot on timeline */}
            <div className="relative z-10 mt-1.5">
              <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                evt.type === 'join'
                  ? 'bg-emerald-400 border-emerald-400'
                  : evt.type === 'leave'
                  ? 'bg-slate-500 border-slate-500'
                  : 'bg-amber-400 border-amber-400'
              }`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <EventIcon type={evt.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{evt.label}</p>
                <p className="text-[11px] text-slate-500">
                  {evt.type === 'join' ? 'Device authenticated and connected'
                    : evt.type === 'leave' ? 'Device disconnected from network'
                    : 'Unrecognized MAC address detected'}
                </p>
              </div>
              <time className="text-xs text-slate-500 font-mono flex-shrink-0">{evt.time}</time>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
)

/* ─── Monitoring Status ───────────────────────────────────────────────── */

const MonitoringStatus = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5"
  >
    <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
      <Radio className="w-5 h-5 text-teal-400" />
      Monitoring Status
    </h3>

    {/* Status indicator */}
    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-5">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
        />
        <div>
          <p className="text-white font-semibold text-sm">Active</p>
          <p className="text-[11px] text-slate-500">All monitoring systems operational</p>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-full border border-emerald-500/30">
          Online
        </span>
      </div>
    </div>

    {/* Stat rows */}
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">Last Scan</span>
        </div>
        <span className="text-sm text-white font-mono font-medium">21:42</span>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2.5">
          <Wifi className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">Devices Online</span>
        </div>
        <span className="text-sm text-white font-mono font-medium">4</span>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">Scan Interval</span>
        </div>
        <span className="text-sm text-white font-mono font-medium">30s</span>
      </div>
    </div>
  </motion.div>
)

/* ─── Live Monitoring Page ────────────────────────────────────────────── */

export default function LiveMonitoring() {
  const { recentEvents, loading, error } = useNetlyData()
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          Live Monitoring
          <span className="text-xs font-normal bg-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            Real-time
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Network activity stream and monitoring status
        </p>
      </motion.div>

      {/* Row: Recent Events + Monitoring Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEvents events={recentEvents} />
        <MonitoringStatus />
      </div>

      {/* Footer */}
      <footer className="text-center pt-6 pb-2 border-t border-white/5">
        <p className="text-xs text-slate-600">Netly Guardian &mdash; Home Network Security</p>
      </footer>
    </div>
  )
}
