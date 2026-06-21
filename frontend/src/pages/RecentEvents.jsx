import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Wifi, WifiOff, AlertTriangle, Search, Filter, Clock,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

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

export default function RecentEvents() {
  const { networkEvents, loading, error } = useNetlyData()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? networkEvents : networkEvents.filter(e => e.type === filter)

  const counts = {
    all: networkEvents.length,
    join: networkEvents.filter(e => e.type === 'join').length,
    leave: networkEvents.filter(e => e.type === 'leave').length,
    unknown: networkEvents.filter(e => e.type === 'unknown').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-6 h-6 text-teal-400" />
          Recent Events
        </h1>
        <p className="text-sm text-slate-400 mt-1">All network activity events</p>
      </motion.div>

      {/* Filter chips */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Events', color: 'text-teal-400' },
          { key: 'join', label: 'Device Joined', color: 'text-emerald-400' },
          { key: 'leave', label: 'Device Left', color: 'text-slate-400' },
          { key: 'unknown', label: 'Unknown Device', color: 'text-amber-400' },
        ].map(opt => (
          <button key={opt.key} onClick={() => setFilter(opt.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              filter === opt.key
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {opt.label}
            <span className="ml-1.5 opacity-60">({counts[opt.key]})</span>
          </button>
        ))}
      </motion.div>

      {/* Event list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-white/5" />
          <div className="space-y-0">
            {filtered.map((evt, idx) => (
              <motion.div key={`${evt.time}-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-start gap-4 pb-5 last:pb-0 relative">
                <div className="relative z-10 mt-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    evt.type === 'join' ? 'bg-emerald-400 border-emerald-400'
                      : evt.type === 'leave' ? 'bg-slate-500 border-slate-500'
                      : 'bg-amber-400 border-amber-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <EventIcon type={evt.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{evt.label}</p>
                    <p className="text-[11px] text-slate-500">{evt.desc} · {evt.device} ({evt.ip})</p>
                  </div>
                  <time className="text-xs text-slate-500 font-mono flex-shrink-0">{evt.time}</time>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last hour</span>
        </div>
      </motion.div>
    </div>
  )
}
