import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, FileText, Save, Loader2, CheckCircle, AlertTriangle,
} from 'lucide-react'

/* =========================================================================
   NoteModal — Create / Edit a device note via the backend API
   ========================================================================= */

export default function NoteModal({ device, existingNote, onClose, onSuccess }) {
  const [note, setNote] = useState(existingNote || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mac: device.mac,
          note: note.trim(),
        }),
      })

      if (!res.ok) throw new Error(`Save failed (${res.status})`)

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 800)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

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
          className="relative w-full max-w-md rounded-2xl bg-netly-bg-secondary border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {existingNote ? 'Edit Note' : 'Add Note'}
                  </h2>
                  <p className="text-xs text-slate-400 truncate max-w-[250px]">
                    {device?.name || 'Device'} · {device?.mac}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="border-t border-white/5" />

            {/* Body */}
            <div className="px-6 py-5">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">Note Saved!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Note updated for {device?.name}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Device Note
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add notes about this device (e.g. location, owner, purpose)..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      This note will be saved to the backend and synced across devices.
                    </p>
                  </div>

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
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      ) : (
                        <><Save className="w-4 h-4" /> {existingNote ? 'Update Note' : 'Save Note'}</>
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
