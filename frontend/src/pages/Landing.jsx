// =============================================================================
// Netly Guardian — Animated Landing Page
// =============================================================================

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Wifi, Monitor, ShieldCheck, ShieldAlert, Activity,
  Bell, Clock, Network, Smartphone, Zap, Users,
  ArrowRight, LogIn, UserPlus, ChevronDown, LayoutDashboard,
} from 'lucide-react'

/* ─── Nav bar (login/register or go to dashboard) ────────────────────── */
function TopNav({ isAuthenticated }) {
  const navigate = useNavigate()
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.5, duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-6 sm:px-10 h-20"
    >
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Get Started
            </button>
          </>
        )}
      </div>
    </motion.nav>
  )
}

/* ─── Feature Card ───────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative group rounded-2xl bg-netly-bg-secondary/80 border border-white/5 p-6 overflow-hidden"
    >
      {/* Hover glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${accent === 'blue' ? 'bg-blue-500' : accent === 'emerald' ? 'bg-emerald-500' : accent === 'violet' ? 'bg-violet-500' : accent === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} />

      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
          accent === 'blue' ? 'bg-blue-500/15 text-blue-400' :
          accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
          accent === 'violet' ? 'bg-violet-500/15 text-violet-400' :
          'bg-amber-500/15 text-amber-400'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

/* ─── Stat counter ───────────────────────────────────────────────────── */
function StatItem({ value, label, delay }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  // Extract leading numeric part (handles ints and decimals like "99.9")
  const numMatch = value.match(/^(\d+(?:\.\d+)?)/)
  const numericTarget = numMatch ? parseFloat(numMatch[1]) : null
  const suffix = numericTarget !== null ? value.slice(numMatch[1].length) : ''

  // "24/7" style values — no numeric prefix, just display as-is
  const isStatic = numericTarget === null

  useEffect(() => {
    if (isStatic) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          let start = 0
          const steps = 30
          const increment = numericTarget / steps
          const interval = setInterval(() => {
            start += increment
            if (start >= numericTarget) {
              start = numericTarget
              clearInterval(interval)
            }
            setCount(start)
          }, 40)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, numericTarget, isStatic])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <p className="text-4xl font-bold gradient-text tabular-nums">
        {isStatic
          ? value
          : Number.isInteger(numericTarget)
            ? Math.round(count) + suffix
            : count.toFixed(1) + suffix
        }
      </p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </motion.div>
  )
}

/* =========================================================================
   Landing Page
   ========================================================================= */

export default function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [stage, setStage] = useState(0) // 0=logo, 1=text, 2=tagline, 3=full
  const featuresRef = useRef(null)

  // Animate intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800)
    const t2 = setTimeout(() => setStage(2), 2000)
    const t3 = setTimeout(() => setStage(3), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    { icon: Wifi, title: 'Network Discovery', desc: 'Automatically detect every device on your home network — from routers and laptops to smart TVs and IoT sensors. Never wonder who\'s connected.', accent: 'blue', delay: 0.1 },
    { icon: Shield, title: 'Security Scoring', desc: 'Real-time security assessment with actionable scores. Track open ports, unknown devices, and threat levels at a glance.', accent: 'emerald', delay: 0.2 },
    { icon: Activity, title: 'Live Monitoring', desc: 'Watch network activity as it happens. See devices join and leave, monitor bandwidth usage, and detect anomalies in real time.', accent: 'violet', delay: 0.3 },
    { icon: Bell, title: 'Smart Alerts', desc: 'Get instant notifications for new devices, security threats, screen time limits, and curfew violations — all customizable.', accent: 'amber', delay: 0.4 },
    { icon: Clock, title: 'Screen Time Control', desc: 'Set daily usage limits and curfews for family devices. Promote healthy digital habits with automated enforcement.', accent: 'blue', delay: 0.5 },
    { icon: Users, title: 'Family Profiles', desc: 'Create profiles for each family member. Manage permissions, set parental controls, and get personalized usage insights.', accent: 'emerald', delay: 0.6 },
  ]

  return (
    <div className="min-h-screen bg-netly-bg-primary relative overflow-hidden">
      {/* ── Background effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-1 animate-float" />
        <div className="gradient-orb gradient-orb-2 animate-float" style={{ animationDelay: '-2s' }} />
        <div className="gradient-orb gradient-orb-3 animate-float" style={{ animationDelay: '-4s' }} />
      </div>
      <div className="noise-overlay" />

      {/* Scan lines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.1) 2px, rgba(59,130,246,0.1) 4px)' }}
      />

      {/* Hex pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(59,130,246,0.15) 1px, transparent 0)', backgroundSize: '50px 50px' }}
      />

      {/* ── Top Navigation ── */}
      <TopNav isAuthenticated={isAuthenticated} />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Animated logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: stage >= 0 ? 1 : 0, opacity: stage >= 0 ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, duration: 0.8 }}
          className="relative mb-6"
        >
          {/* Glow behind logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: stage >= 1 ? 0.3 : 0, scale: stage >= 1 ? 1.5 : 0.5 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="absolute inset-0 w-28 h-28 bg-blue-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
          />

          <motion.div
            animate={{ rotate: stage >= 1 ? [0, -5, 5, -3, 0] : 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
          >
            <Shield className="w-14 h-14 text-white" />
          </motion.div>
        </motion.div>

        {/* App name */}
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="text-5xl sm:text-7xl font-bold mb-2">
                <span className="gradient-text">Netly</span>{' '}
                <span className="text-white">Guardian</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/50" />
                <span className="text-[10px] tracking-[0.3em] text-blue-400/60 font-mono uppercase">Home Network Security</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-center max-w-2xl mt-4"
            >
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
                Protect your home network with intelligent threat detection, real-time monitoring, and family controls.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Buttons */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 mt-8"
            >
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/app')}
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all shadow-xl shadow-blue-500/20"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all shadow-xl shadow-blue-500/20"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3.5 rounded-xl border border-white/10 text-base text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll indicator */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.button
              key="scroll"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={scrollToFeatures}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="text-xs tracking-widest uppercase">Explore</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="relative z-10 px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="1000+" label="Networks Protected" delay={0.1} />
            <StatItem value="50K+" label="Devices Monitored" delay={0.2} />
            <StatItem value="99.9" label="Uptime" delay={0.3} />
            <StatItem value="24/7" label="Real-time Protection" delay={0.4} />
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section ref={featuresRef} className="relative z-10 px-4 sm:px-6 py-20" id="features">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to{' '}
              <span className="gradient-text">secure your home</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From automatic device discovery to intelligent threat prevention,
              Netly Guardian gives you complete visibility and control over your home network.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10 px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-3xl" />
          <div className="relative rounded-3xl bg-gradient-to-b from-netly-bg-secondary/80 to-netly-bg-secondary/40 border border-white/5 p-12">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to protect your network?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of families already using Netly Guardian to keep their home networks safe and secure.
            </p>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app')}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all shadow-xl shadow-blue-500/20"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold text-white hover:from-blue-400 hover:to-blue-500 transition-all shadow-xl shadow-blue-500/20"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold gradient-text">Netly Guardian</span>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Netly Guardian &mdash; Home Network Security. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
