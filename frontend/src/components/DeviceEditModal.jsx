import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Loader2, CheckCircle, AlertTriangle,
  Pencil, User, Clock, Save,
} from 'lucide-react'

/* ─── Edit operation tabs ─────────────────────────────────────────────── */

const TABS = [
  { id: 'rename', label: 'Rename', icon: Pencil },
  { id: 'owner', label: 'Owner', icon: User },
  { id: 'limit', label: 'Screen Time', icon: Clock },
]

/* ─── Modal ───────────────────────────────────────────────────────────── */

export default function DeviceEditModal({ device, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('rename')
  const [name, setName] = useState(device?.name || '')
  const [owner, setOwner] = useState(device?.owner || '')
  const [limitMinutes, setLimitMinutes] = useState(device?.screenTimeLimit || 60)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      // Decide which API to call based on active tab
      if (activeTab === 'rename') {
        const res = await fetch('/api/rename-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), mac: device.mac }),
        })
        if (!res.ok) throw new Error(`Rename failed (${res.status})`)
        setSuccessMsg(`Device renamed to "${name.trim()}"`)

      } else if (activeTab === 'owner') {
        const res = await fetch('/api/rename-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), owner: owner.trim(), mac: device.mac }),
        })
        if (!res.ok) throw new Error(`Update failed (${res.status})`)
        setSuccessMsg(`Owner changed to "${owner.trim()}"`)

      } else if (activeTab === 'limit') {
        const res = await fetch('/api/set-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mac: device.mac,
            limit_minutes: parseInt(limitMinutes, 10) || 0,
            owner: owner.trim() || device.owner || undefined,
          }),
        })
        if (!res.ok) throw new Error(`Set limit failed (${res.status})`)
        setSuccessMsg(`Screen time limit set to ${limitMinutes} minutes`)
      }

      // Brief success then close + refresh
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const tabContent = () => {
    switch (activeTab) {
      case 'rename':
        return (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">New Device Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rishitha's Phone"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        )
      case 'owner':
        return (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Change Owner</label>
            <input
              type="text"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              placeholder="e.g. Rishitha"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">This will also update the device owner in your profile</p>
          </div>
        )
      case 'limit':
        return (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Screen Time Limit (minutes)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={1440}
                value={limitMinutes}
                onChange={e => setLimitMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
              <span className="text-xs text-slate-500 flex-shrink-0">mins/day</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {[30, 60, 120, 180, 300].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLimitMinutes(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    parseInt(limitMinutes) === v
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {v >= 60 ? `${v / 60}h` : `${v}m`}
                </button>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const currentDevice = device?.name || 'Unknown'
  const canSubmit = (activeTab === 'rename' && name.trim())
    || (activeTab === 'owner' && owner.trim())
    || (activeTab === 'limit')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-2xl bg-netly-bg-secondary border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
                  <Pencil className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Device</h2>
                  <p className="text-xs text-slate-400">{currentDevice} · {device?.mac}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="border-t border-white/5" />

            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors relative ${
                      isActive
                        ? 'text-blue-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                        <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {successMsg ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">Updated!</p>
                  <p className="text-sm text-slate-400 mt-1">{successMsg}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* MAC (read-only) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">MAC Address</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="font-mono text-sm text-slate-300">{device?.mac || '—'}</span>
                      <span className="text-[10px] text-slate-600 ml-auto">read-only</span>
                    </div>
                  </div>

                  {/* Tab content */}
                  {tabContent()}

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">{error}</p>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !canSubmit}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
