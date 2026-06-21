import React from 'react'
import { motion } from 'framer-motion'
import {
  Wifi, Clock, ArrowRight,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

export default function DeviceJoined() {
  const { networkEvents, loading, error } = useNetlyData()
  const events = networkEvents.filter(e => e.type === 'join')

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Wifi className="w-6 h-6 text-emerald-400" />
          Device Joined
        </h1>
        <p className="text-sm text-slate-400 mt-1">{events.length} devices connected to the network</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5">
        <div className="space-y-3">
          {events.map((evt, idx) => (
            <motion.div key={`${evt.time}-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 hover:bg-emerald-500/10 transition-colors">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Wifi className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{evt.device} connected</p>
                <p className="text-xs text-slate-500 mt-0.5">{evt.desc} · {evt.ip}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{evt.time}</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-500">
          {events.length} join event{events.length !== 1 ? 's' : ''} recorded
        </div>
      </motion.div>
    </div>
  )
}
