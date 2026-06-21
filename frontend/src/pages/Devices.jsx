import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone, Laptop, Tablet, Tv, Radio, HelpCircle, Wifi,
  Search, Filter, ArrowUpDown, Ban, ShieldCheck, ShieldAlert,
  MoreHorizontal, Loader2, AlertTriangle,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

const DeviceIcon = ({ type, className = 'w-5 h-5' }) => {
  const map = { phone: Smartphone, laptop: Laptop, tablet: Tablet, tv: Tv, iot: Radio, router: Wifi }
  const Icon = map[type] || HelpCircle
  return <Icon className={className} />
}

const StatusBadge = ({ status }) => {
  if (status === 'unknown') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
      <ShieldAlert className="w-3 h-3" /> Unknown
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <ShieldCheck className="w-3 h-3" /> Known
    </span>
  )
}

export default function Devices() {
  const { devices, enrichedDevices, stats, loading, error } = useNetlyData()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('ip')
  const [sortDir, setSortDir] = useState('asc')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = enrichedDevices
    .filter(d => {
      const q = search.toLowerCase()
      return !q || d.ip.includes(q) || d.mac.includes(q) || d.name.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q)
    })
    .filter(d => filterStatus === 'all' || d.status === filterStatus)
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase()
      const valB = (b[sortField] || '').toString().toLowerCase()
      const cmp = valA.localeCompare(valB)
      return sortDir === 'asc' ? cmp : -cmp
    })

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const knownCount = devices.filter(d => d.status === 'known').length
  const unknownCount = devices.filter(d => d.status === 'unknown').length

  const SortHeader = ({ field, label }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-teal-400' : 'text-slate-600'}`} />
      </div>
    </th>
  )

  // ── Loading state ──
  if (loading && devices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="h-4 w-64 skeleton rounded" />
        <div className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 skeleton rounded" />
                <div className="h-2 w-48 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load device data</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Devices</h1>
        <p className="text-sm text-slate-400">{devices.length} devices · {knownCount} known · {unknownCount} unknown</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, IP, MAC, vendor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-teal-500/50 focus:bg-white/10 transition-all outline-none text-sm text-white placeholder:text-slate-500"
          />
        </div>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 outline-none focus:border-teal-500/50">
          <option value="all">All Status</option>
          <option value="known">Known</option>
          <option value="unknown">Unknown</option>
        </select>

        <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                <SortHeader field="ip" label="IP Address" />
                <SortHeader field="mac" label="MAC Address" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                <SortHeader field="status" label="Status" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Signal</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No devices match your filters</p>
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <motion.tr
                    key={d.mac}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.015 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${d.isBlocked ? 'bg-red-500/10' : d.status === 'known' ? 'bg-teal-500/10' : 'bg-amber-500/10'}`}>
                          <DeviceIcon type={d.type} className={`w-5 h-5 ${d.isBlocked ? 'text-red-400' : d.status === 'known' ? 'text-teal-400' : 'text-amber-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{d.name}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{d.type} · {d.hostname}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{d.ip}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{d.mac}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{d.vendor}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${d.status === 'unknown' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-xs text-slate-400">{d.signalStrength}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-slate-500">
          <span>{filtered.length} of {devices.length} devices</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full" /> {knownCount} known</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" /> {unknownCount} unknown</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
