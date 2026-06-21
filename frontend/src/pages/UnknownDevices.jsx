import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle, Search, ShieldAlert, ShieldCheck, Ban, MoreHorizontal, ArrowUpDown,
} from 'lucide-react'
import { useNetlyData } from '../data/useNetlyData'

export default function UnknownDevices() {
  const { enrichedDevices, stats, loading, error } = useNetlyData()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('ip')
  const [sortDir, setSortDir] = useState('asc')

  const unknown = enrichedDevices.filter(d => d.status === 'unknown')
  const filtered = unknown
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
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Unknown Devices
        </h1>
        <p className="text-sm text-slate-400 mt-1">{stats.unknownCount} unrecognized device{stats.unknownCount !== 1 ? 's' : ''} detected</p>
      </motion.div>

      {unknown.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-12 bg-netly-bg-secondary border border-white/5 text-center">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-40" />
          <p className="text-white font-medium text-lg">No unknown devices</p>
          <p className="text-sm text-slate-500 mt-1">All devices on your network are recognized</p>
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search IP or MAC…" value={search}
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((d, idx) => (
                    <motion.tr key={d.mac} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <HelpCircle className="w-5 h-5 text-red-400" />
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                          <Ban className="w-3 h-3" /> Suspicious
                        </span>
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
              <span>{filtered.length} unknown device{filtered.length !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Requires attention</span>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
