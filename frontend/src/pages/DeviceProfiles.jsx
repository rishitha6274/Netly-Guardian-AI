import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Search, Wifi, WifiOff, Clock, Moon, Sun,
  User, FileText, X, ChevronDown, ArrowUpDown, ShieldCheck,
  ShieldAlert, Activity, AlertTriangle, CheckCircle, Radio,
  CornerDownRight, Loader2, SlidersHorizontal, Eye, Maximize2, Ban,
} from 'lucide-react'

/* =========================================================================
   Helpers
   ========================================================================= */

const formatMinutes = (m) => {
  if (m == null) return '—'
  if (m < 60) return `${Math.round(m)}m`
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return min > 0 ? `${h}h ${min}m` : `${h}h`
}

const formatTime = (t) => t || '—'

const truncate = (s, n = 40) => (s && s.length > n ? s.slice(0, n) + '…' : s) || ''

const getStatusColor = (status) =>
  status === 'known' ? 'emerald' : 'red'

const getStatusHex = (status) =>
  status === 'known' ? '#22c55e' : '#ef4444'

/* =========================================================================
   Animated Background Particles
   ========================================================================= */

function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
            y: [0, -30],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* =========================================================================
   Status Badge
   ========================================================================= */

function StatusBadge({ status, pulse = false }) {
  const color = getStatusColor(status)
  const isKnown = status === 'known'
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
      isKnown
        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        : 'bg-red-500/15 text-red-300 border-red-500/30'
    }`}>
      {pulse && (
        <span className={`relative flex w-2 h-2`}>
          <span className={`absolute inline-flex w-full h-full rounded-full opacity-75 ${
            isKnown ? 'bg-emerald-400' : 'bg-red-400'
          } ${pulse ? 'animate-ping' : ''}`} />
          <span className={`relative inline-flex w-2 h-2 rounded-full ${
            isKnown ? 'bg-emerald-400' : 'bg-red-400'
          }`} />
        </span>
      )}
      {!pulse && (
        <span className={`w-2 h-2 rounded-full ${
          isKnown ? 'bg-emerald-400' : 'bg-red-400'
        }`} />
      )}
      {isKnown ? 'Known' : 'Unknown'}
    </div>
  )
}

/* =========================================================================
   Curfew Timeline
   ========================================================================= */

function CurfewTimeline({ start, end }) {
  const hasCurfew = start && end && start !== '' && end !== ''

  if (!hasCurfew) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
        <Moon className="w-3 h-3" />
        <span>No curfew set</span>
      </div>
    )
  }

  // Convert to 24h minutes for positioning
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const startMins = toMins(start)
  const endMins = toMins(end)
  const isOvernight = startMins > endMins
  const totalSpan = isOvernight ? 1440 - startMins + endMins : endMins - startMins

  const startPct = (startMins / 1440) * 100
  const endPct = (endMins / 1440) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 flex items-center gap-1">
          <Moon className="w-3 h-3 text-blue-400" />
          Curfew
        </span>
        <span className="text-blue-300 font-mono text-[10px]">
          {start} – {end}
          {isOvernight ? ' (overnight)' : ''}
        </span>
      </div>
      {/* 24h bar */}
      <div className="relative w-full h-5 rounded-md bg-white/5 overflow-hidden">
        {/* Hour markers */}
        <div className="absolute inset-0 flex">
          {[0, 6, 12, 18, 23].map((h) => (
            <div key={h} className="flex-1 border-r border-white/[0.03] last:border-0 relative">
              <span className="absolute -bottom-3 left-0.5 text-[8px] text-slate-700 font-mono">
                {h.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {/* Curfew block */}
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-x border-blue-400/30 rounded-sm"
          style={{
            left: isOvernight ? 0 : `${startPct}%`,
            width: isOvernight
              ? `${((1440 - startMins) / 1440) * 100}%`
              : `${totalSpan / 1440 * 100}%`,
          }}
        />
        {isOvernight && (
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-x border-blue-400/30 rounded-sm"
            style={{
              left: 0,
              width: `${(endMins / 1440) * 100}%`,
            }}
          />
        )}
        {/* Start marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-blue-400 z-10"
          style={{ left: `${startPct}%` }}
        />
        {/* End marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-indigo-400 z-10"
          style={{ left: `${endPct}%` }}
        />
      </div>
    </div>
  )
}

/* =========================================================================
   Detail Modal
   ========================================================================= */

const DETAIL_TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'usage', label: 'Usage & Limits', icon: Activity },
  { id: 'notes', label: 'Notes', icon: FileText },
]

function DeviceDetailModal({ device, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [noteText, setNoteText] = useState(device?.note || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [togglingRestrict, setTogglingRestrict] = useState(false)

  const handleSaveNote = async () => {
    if (!device?.mac) return
    setSaving(true)
    try {
      const res = await fetch('/api/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: device.mac, note: noteText }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleToggleRestrict = async (e) => {
    e.stopPropagation()
    if (!device?.mac) return
    setTogglingRestrict(true)
    try {
      const endpoint = device?.restricted ? '/api/unrestrict-device' : '/api/restrict-device'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: device.mac }),
      })
      if (res.ok) {
        onClose() // close modal → parent refreshes profiles
        return
      }
    } catch { /* ignore */ }
    setTogglingRestrict(false)
  }

  const isKnown = device?.status === 'known'
  const usagePct = device?.daily_limit > 0
    ? Math.min((device.minutes_online / (device.daily_limit * 60)) * 100, 100)
    : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl rounded-2xl bg-netly-bg-secondary border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Background glow */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isKnown ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isKnown ? 'bg-blue-500/10' : 'bg-orange-500/10'
          }`} />

          <div className="relative z-10">
            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Icon */}
                  <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl border flex items-center justify-center ${
                    isKnown
                      ? 'bg-emerald-500/15 border-emerald-500/25'
                      : 'bg-red-500/15 border-red-500/25'
                  }`}>
                    <Radio className={`w-7 h-7 ${isKnown ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isKnown ? 'bg-emerald-400' : 'bg-red-400'
                    } animate-ping opacity-70`} />
                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isKnown ? 'bg-emerald-400' : 'bg-red-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white truncate">{device?.name || 'Unnamed'}</h2>
                      <StatusBadge status={device?.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="font-mono">{device?.mac || '—'}</span>
                      {device?.ip && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="font-mono">{device.ip}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-3">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* ── Tabs ── */}
            <div className="flex border-b border-white/5 px-6">
              {DETAIL_TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="detail-tab"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-400 rounded-full"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Tab Content ── */}
            <div className="px-6 py-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField label="Device Name" value={device?.name || '—'} />
                    <DetailField label="Owner" value={device?.owner || '—'} />
                    <DetailField label="MAC Address" value={device?.mac || '—'} mono />
                    <DetailField label="IP Address" value={device?.ip || '—'} mono />
                    <DetailField label="Status">
                      <StatusBadge status={device?.status} pulse />
                    </DetailField>
                    <DetailField label="Online Status">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${device?.online ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {device?.online ? <><Wifi className="w-4 h-4" /> Online</> : <><WifiOff className="w-4 h-4" /> Offline</>}
                      </span>
                    </DetailField>
                    <DetailField label="Blocked">
                      {device?.blocked ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400">
                          <Ban className="w-4 h-4" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                          <CheckCircle className="w-4 h-4" /> Not Blocked
                        </span>
                      )}
                    </DetailField>
                    <DetailField label="Restricted">
                      <div className="flex items-center gap-2 flex-wrap">
                        {device?.restricted ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
                            <ShieldAlert className="w-4 h-4" /> Restricted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                            <CheckCircle className="w-4 h-4" /> Not Restricted
                          </span>
                        )}
                        {device?.status === 'known' && (
                          <button
                            onClick={handleToggleRestrict}
                            disabled={togglingRestrict}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                              device?.restricted
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-orange-500/15 text-orange-300 border-orange-500/30 hover:bg-orange-500/25'
                            }`}
                          >
                            {togglingRestrict ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> ...</>
                            ) : device?.restricted ? (
                              <><CheckCircle className="w-3 h-3" /> Unrestrict</>
                            ) : (
                              <><ShieldAlert className="w-3 h-3" /> Restrict</>
                            )}
                          </button>
                        )}
                      </div>
                    </DetailField>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <div className={`rounded-xl p-3 border ${
                      isKnown
                        ? 'bg-emerald-500/5 border-emerald-500/15'
                        : 'bg-red-500/5 border-red-500/15'
                    }`}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Minutes Online</p>
                      <p className="text-sm font-bold text-white mt-0.5">{formatMinutes(device?.minutes_online)}</p>
                    </div>
                    <div className={`rounded-xl p-3 border ${
                      isKnown
                        ? 'bg-emerald-500/5 border-emerald-500/15'
                        : 'bg-red-500/5 border-red-500/15'
                    }`}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Daily Limit</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {device?.daily_limit > 0 ? formatMinutes(device.daily_limit * 60) : 'Unlimited'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Curfew Start</p>
                      <p className="text-sm font-bold text-white mt-0.5">{formatTime(device?.curfew_start)}</p>
                    </div>
                    <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Curfew End</p>
                      <p className="text-sm font-bold text-white mt-0.5">{formatTime(device?.curfew_end)}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'usage' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Usage vs Limit */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        Time Online
                      </span>
                      <span className="text-sm font-bold text-white tabular-nums">
                        {formatMinutes(device?.minutes_online)}
                        {device?.daily_limit > 0 && (
                          <span className="text-xs text-slate-500 font-normal">
                            {' '}/ {formatMinutes(device.daily_limit * 60)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          usagePct >= 100
                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                            : usagePct >= 80
                            ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                            : 'bg-gradient-to-r from-blue-500 to-blue-400'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px]">
                      <span className="text-slate-600">Usage</span>
                      {device?.daily_limit > 0 && (
                        <span className={usagePct >= 100 ? 'text-red-400' : 'text-slate-500'}>
                          {usagePct >= 100 ? 'Limit reached' : `${Math.round(usagePct)}% of limit`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Daily Limit Setting */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-300">Daily Limit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Current:</span>
                      <span className="font-bold text-white">
                        {device?.daily_limit > 0 ? formatMinutes(device.daily_limit * 60) : 'No limit set'}
                      </span>
                    </div>
                  </div>

                  {/* Curfew Timeline */}
                  <CurfewTimeline start={device?.curfew_start} end={device?.curfew_end} />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-300">Device Notes</span>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={e => { setNoteText(e.target.value); setSaved(false) }}
                    placeholder="Add notes about this device..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">{noteText.length} characters</p>
                    <button
                      onClick={handleSaveNote}
                      disabled={saving}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        saved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25'
                      }`}
                    >
                      {saving ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                      ) : saved ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Save Note</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DetailField({ label, value, mono, children }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      {children || (
        <p className={`text-sm font-medium text-white ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}

/* =========================================================================
   Device Card
   ========================================================================= */

function DeviceProfileCard({ device, onSelect, idx }) {
  const isKnown = device?.status === 'known'
  const usagePct = device?.daily_limit > 0
    ? Math.min((device.minutes_online / (device.daily_limit * 60)) * 100, 100)
    : 0
  const hasCurfew = device?.curfew_start && device?.curfew_end &&
    device.curfew_start !== '' && device.curfew_end !== ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onSelect(device)}
      className="relative group cursor-pointer rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
    >
      {/* Top accent border */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${
        isKnown ? 'emerald' : 'red'
      }-500/50 to-transparent`} />

      {/* Data flow scan line */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="scan-line" />
      </div>

      {/* Particle corner decorations */}
      <div className="absolute top-0 right-0 w-20 h-20">
        <div className="absolute top-0 right-0 w-10 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 right-0 h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      <div className="p-5 relative z-10">
        {/* ── Row 1: Name + Status badges ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
              {device?.name || 'Unnamed'}
            </h3>
            {device?.owner && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {device.owner}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            <StatusBadge status={device?.status} pulse />
            {device?.blocked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                <Ban className="w-3 h-3" />
                Blocked
              </span>
            )}
            {device?.restricted && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                <ShieldAlert className="w-3 h-3" />
                Restricted
              </span>
            )}
          </div>
        </div>

        {/* ── Row 2: Online indicator + IP + MAC ── */}
        <div className="flex items-center gap-2 mb-3 text-[11px]">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
            device?.online
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
          }`}>
            {device?.online ? (
              <><Wifi className="w-3 h-3" /><span className="font-mono">Online</span></>
            ) : (
              <><WifiOff className="w-3 h-3" /><span className="font-mono">Offline</span></>
            )}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/5">
            <span className="font-mono text-slate-400">{device?.ip || '—'}</span>
          </div>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-600 truncate">{device?.mac || '—'}</span>
        </div>

        {/* ── Row 3: Online Time ── */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Online
            </span>
            <span className="font-semibold text-white tabular-nums font-mono">
              {formatMinutes(device?.minutes_online)}
            </span>
          </div>
          {device?.daily_limit > 0 && (
            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePct}%` }}
                transition={{ duration: 1, delay: 0.2 + idx * 0.05, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  usagePct >= 100
                    ? 'bg-red-500'
                    : usagePct >= 80
                    ? 'bg-orange-500'
                    : 'bg-blue-500'
                }`}
              />
            </div>
          )}
        </div>

        {/* ── Row 4: Limit + Curfew pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Daily limit pill */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border ${
            device?.daily_limit > 0
              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
              : 'bg-white/[0.03] text-slate-600 border-white/5'
          }`}>
            <Activity className="w-3 h-3" />
            {device?.daily_limit > 0 ? `${formatMinutes(device.daily_limit * 60)}/d` : 'No limit'}
          </div>

          {/* Curfew pill */}
          {hasCurfew ? (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium">
              <Moon className="w-3 h-3" />
              {device.curfew_start}–{device.curfew_end}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] text-slate-600 border border-white/5 text-[10px] font-medium">
              <Moon className="w-3 h-3" />
              No curfew
            </div>
          )}

          {/* Note indicator */}
          {device?.note && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium" title={device.note}>
              <FileText className="w-3 h-3" />
              Note
            </div>
          )}
        </div>
      </div>

      {/* Bottom hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-500/40 to-transparent transition-all duration-500" />
    </motion.div>
  )
}

/* =========================================================================
   Device Profiles Page
   ========================================================================= */

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'minutes_online', label: 'Time Online' },
  { value: 'status', label: 'Status' },
]

export default function DeviceProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/device-profiles')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setProfiles(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load device profiles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  // Derived stats
  const stats = useMemo(() => {
    const total = profiles.length
    const known = profiles.filter(d => d.status === 'known').length
    const unknown = profiles.filter(d => d.status === 'unknown').length
    const avgOnline = total > 0
      ? Math.round(profiles.reduce((s, d) => s + (d.minutes_online || 0), 0) / total)
      : 0
    return { total, known, unknown, avgOnline }
  }, [profiles])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...profiles]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.owner || '').toLowerCase().includes(q) ||
        (d.mac || '').toLowerCase().includes(q) ||
        (d.ip || '').toLowerCase().includes(q) ||
        (d.note || '').toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'minutes_online') return (b.minutes_online || 0) - (a.minutes_online || 0)
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '')
      return 0
    })

    return result
  }, [profiles, statusFilter, search, sortBy])

  // ── Loading skeleton ──
  if (loading && profiles.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="h-12 w-80 skeleton rounded-lg" />
        <div className="h-4 w-96 skeleton rounded" />

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-3">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="h-8 w-12 skeleton rounded" />
              <div className="h-3 w-20 skeleton rounded" />
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="h-12 skeleton rounded-xl" />

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-3 w-20 skeleton rounded" />
                </div>
                <div className="h-6 w-16 skeleton rounded-full" />
              </div>
              <div className="h-3 w-48 skeleton rounded" />
              <div className="space-y-1"><div className="h-3 skeleton rounded" /><div className="h-1 skeleton rounded-full" /></div>
              <div className="flex gap-2"><div className="h-5 w-16 skeleton rounded-lg" /><div className="h-5 w-20 skeleton rounded-lg" /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load device profiles</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={fetchProfiles}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Cinematic Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        <ParticleField />
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute bottom-0 left-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
                <Monitor className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Device Profiles</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1 ml-1">
              Comprehensive view of all devices across your network with usage data, limits, and curfews
            </p>
          </div>

          <button
            onClick={fetchProfiles}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
          >
            <Clock className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Quick stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Total Devices', value: stats.total, icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Known', value: stats.known, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Unknown', value: stats.unknown, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Avg Online', value: formatMinutes(stats.avgOnline), icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1 rounded-md ${stat.bg}`}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-white tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, owner, IP, MAC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {['all', 'known', 'unknown'].map(s => {
            const isActive = statusFilter === s
            const isBad = s === 'unknown'
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? isBad
                      ? 'bg-red-500/15 text-red-300 border-red-500/30'
                      : s === 'known'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    : 'bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && (
                  <span className={`ml-1.5 text-[10px] ${
                    isActive ? '' : 'text-slate-600'
                  }`}>
                    ({s === 'known' ? stats.known : stats.unknown})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 outline-none focus:border-blue-500/50 cursor-pointer hover:bg-white/10 transition-all"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Toggle filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
            showFilters
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : 'bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>

        {/* Result count */}
        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} of {profiles.length} devices
        </span>
      </motion.div>

      {/* ── Expanded Filters (optional) ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Has curfew:</span>
                  <button className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all">
                    Any
                  </button>
                  <button className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all">
                    Yes
                  </button>
                  <button className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all">
                    No
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Has note:</span>
                  <button className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all">
                    Any
                  </button>
                  <button className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all">
                    Yes
                  </button>
                  <button className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all">
                    No
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Device Cards Grid ── */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/5 mb-4">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-base font-semibold text-slate-400">No devices match your criteria</p>
          <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all') }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
          >
            Clear filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((device, idx) => (
              <DeviceProfileCard
                key={device.mac || idx}
                device={device}
                idx={idx}
                onSelect={setSelectedDevice}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedDevice && (
        <DeviceDetailModal
          device={selectedDevice}
          onClose={() => {
            setSelectedDevice(null)
            fetchProfiles() // Refresh to pick up note changes
          }}
        />
      )}
    </div>
  )
}
