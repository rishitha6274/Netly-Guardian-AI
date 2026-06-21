import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ArrowUpDown, ShieldCheck, ShieldAlert,
  Smartphone, Laptop, Tablet, Tv, Radio, HelpCircle, Wifi,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

const DeviceIcon = ({ type, className = 'w-4 h-4' }) => {
  const map = { phone: Smartphone, laptop: Laptop, tablet: Tablet, tv: Tv, iot: Radio, router: Wifi }
  const Icon = map[type] || HelpCircle
  return <Icon className={className} />
}

const StatusDot = ({ status }) => (
  <span className={`w-2 h-2 rounded-full ${status === 'known' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
)

export default function DeviceInventory() {
  const { devices, enrichedDevices, stats, loading, error } = useNetlyData()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const filtered = enrichedDevices
    .filter(d => {
      const q = search.toLowerCase()
      return !q || d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.mac.includes(q) || d.vendor.toLowerCase().includes(q)
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
    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none" onClick={() => toggleSort(field)}>
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
          <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Device Inventory
        </h1>
        <p className="text-sm text-slate-400 mt-1">Complete inventory of all devices · {devices.length} total</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search inventory…" value={search}
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
                <SortHeader field="name" label="Name" />
                <SortHeader field="ip" label="IP" />
                <SortHeader field="mac" label="MAC" />
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                <SortHeader field="status" label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((d, idx) => (
                <motion.tr key={d.mac} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.015 }}
                  className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${d.status === 'known' ? 'bg-teal-500/10' : 'bg-amber-500/10'}`}>
                        <DeviceIcon type={d.type} className={`w-4 h-4 ${d.status === 'known' ? 'text-teal-400' : 'text-amber-400'}`} />
                      </div>
                      <span className="text-sm text-white font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{d.ip}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{d.mac}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-400">{d.vendor}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={d.status} />
                      <span className={`text-xs font-medium ${d.status === 'known' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {d.status === 'known' ? 'Known' : 'Unknown'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-slate-500">
          <span>{filtered.length} of {devices.length} devices</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><StatusDot status="known" /> {stats.knownCount} known</span>
            <span className="flex items-center gap-1"><StatusDot status="unknown" /> {stats.unknownCount} unknown</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
