import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone, Laptop, Tablet, Tv, Radio, HelpCircle, Wifi,
  Search, ArrowUpDown, ShieldCheck, MoreHorizontal,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

const DeviceIcon = ({ type, className = 'w-5 h-5' }) => {
  const map = { phone: Smartphone, laptop: Laptop, tablet: Tablet, tv: Tv, iot: Radio, router: Wifi }
  const Icon = map[type] || HelpCircle
  return <Icon className={className} />
}

export default function KnownDevices() {
  const { enrichedDevices, stats, loading, error } = useNetlyData()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('ip')
  const [sortDir, setSortDir] = useState('asc')

  const known = enrichedDevices.filter(d => d.status === 'known')
  const filtered = known
    .filter(d => {
      const q = search.toLowerCase()
      return !q || d.ip.includes(q) || d.mac.includes(q) || d.name.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q)
    })
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

  const SortHeader = ({ field, label }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-teal-400' : 'text-slate-600'}`} />
      </div>
    </th>
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Known Devices
        </h1>
        <p className="text-sm text-slate-400 mt-1">{stats.knownCount} trusted devices on your network</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search name, IP, MAC, vendor…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-teal-500/50 focus:bg-white/10 transition-all outline-none text-sm text-white placeholder:text-slate-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                <SortHeader field="ip" label="IP Address" />
                <SortHeader field="mac" label="MAC Address" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Signal</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((d, idx) => (
                <motion.tr key={d.mac} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10">
                        <DeviceIcon type={d.type} className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{d.name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{d.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{d.ip}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{d.mac}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{d.vendor}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-xs text-slate-400">{d.signalStrength}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-slate-500">
          <span>{filtered.length} known devices</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full" /> All trusted</span>
        </div>
      </motion.div>
    </div>
  )
}
