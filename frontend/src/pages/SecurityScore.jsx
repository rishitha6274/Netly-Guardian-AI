import React from 'react'
import { motion } from 'framer-motion'
import {
  Shield, ShieldCheck, ShieldAlert, AlertTriangle,
  Clock, Ban, CheckCircle, Wifi, ArrowUpRight,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

const FactorRow = ({ label, value, status }) => {
  const icon = status === 'good' ? CheckCircle : status === 'warn' ? AlertTriangle : ShieldAlert
  const color = status === 'good' ? 'text-emerald-400' : status === 'warn' ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-3">
        {React.createElement(icon, { className: `w-4 h-4 ${color}` })}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}

export default function SecurityScore() {
  const { stats, devices, loading, error } = useNetlyData()
  const score = Math.round(stats.securityScore)
  const circumference = 2 * Math.PI * 80
  const offset = circumference * (1 - score / 100)
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-6 h-6 text-teal-400" />
          Security Score
        </h1>
        <p className="text-sm text-slate-400 mt-1">Overall network security assessment</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Ring — big version */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5 lg:col-span-1">
          <div className="flex flex-col items-center py-4">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
                <circle cx="88" cy="88" r="80" fill="none" stroke="#1e293b" strokeWidth="10" />
                <motion.circle cx="88" cy="88" r="80" fill="none" stroke={color} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  className="text-5xl font-bold text-white">{score}</motion.span>
                <span className="text-xs text-slate-500 mt-1">/ 100</span>
              </div>
            </div>
            <span className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
              score >= 85 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : score >= 70 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {score >= 85 ? 'LOW RISK' : score >= 70 ? 'MEDIUM RISK' : 'HIGH RISK'}
            </span>
          </div>
        </motion.div>

        {/* Score Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5 lg:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Score Breakdown
          </h3>

          <div className="space-y-3">
            <FactorRow label="Known Devices" value={`${stats.knownCount}/${stats.totalDevices}`} status="good" />
            <FactorRow label="Unknown Devices" value={stats.unknownCount.toString()} status={stats.unknownCount === 0 ? 'good' : 'warn'} />
            <FactorRow label="Open Ports" value={stats.openPorts?.length ? stats.openPorts.join(', ') : '0'} status="good" />
            <FactorRow label="Threats Blocked (Week)" value={stats.threatsBlockedThisWeek.toString()} status="good" />
            <FactorRow label="Unread Alerts" value={stats.unreadAlerts.toString()} status={stats.unreadAlerts === 0 ? 'good' : 'warn'} />
            <FactorRow label="Critical Alerts" value={stats.criticalAlerts.toString()} status={stats.criticalAlerts === 0 ? 'good' : 'warn'} />
          </div>
        </motion.div>
      </div>

      {/* Open Ports Detail */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-teal-400" />
          Open Ports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.openPorts.map(port => (
            <div key={port} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-2xl font-bold text-white font-mono">{port}</p>
              <p className="text-xs text-slate-500 mt-1">
                {port === 53 ? 'DNS' : port === 80 ? 'HTTP' : port === 443 ? 'HTTPS' : 'Unknown'}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Expected
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> All open ports are standard and expected for home network operation
        </p>
      </motion.div>

      {/* Footer */}
      <footer className="text-center pt-6 pb-2 border-t border-white/5">
        <p className="text-xs text-slate-600">Netly Guardian &mdash; Home Network Security</p>
      </footer>
    </div>
  )
}
