import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'

export default function Notification({ message, visible, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [visible, onClose, duration])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-20 right-4 sm:right-6 z-[100] max-w-sm"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <div className="p-1 rounded-full bg-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm text-emerald-200 font-medium flex-1">{message}</p>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10 transition-colors">
              <X className="w-3.5 h-3.5 text-emerald-400/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
