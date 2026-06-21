import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, TrendingUp, TrendingDown, Activity, Clock,
  ArrowUpRight, ArrowDownRight, BarChart3, LineChart,
  AlertTriangle, Zap, Target, Radar,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Dot,
} from 'recharts'

/* =========================================================================
   Helpers
   ========================================================================= */

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month} ${day}, ${hour}:${min}`
}

const formatShortTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  return `${month} ${day}`
}

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

const getScoreLabelColor = (score) => {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

const getScoreBg = (score) => {
  if (score >= 80) return 'from-emerald-500/20 to-emerald-600/5'
  if (score >= 60) return 'from-blue-500/20 to-blue-600/5'
  if (score >= 40) return 'from-orange-500/20 to-orange-600/5'
  return 'from-red-500/20 to-red-600/5'
}

/* =========================================================================
   Custom Dot — Animated glowing dot for the chart
   ========================================================================= */

const GlowDot = ({ cx, cy, payload }) => {
  if (!cx || !cy) return null
  const score = payload?.score ?? 0
  const color = getScoreColor(score)

  return (
    <svg x={cx - 8} y={cy - 8} width={16} height={16}>
      {/* Glow ring */}
      <circle cx={8} cy={8} r={7} fill="none" stroke={color} strokeWidth="1.5" opacity={0.4}>
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Core dot */}
      <circle cx={8} cy={8} r={3} fill={color}>
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

/* =========================================================================
   Custom Tooltip
   ========================================================================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0]
  const score = d.value
  const ts = d.payload?.timestamp
  const color = getScoreColor(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-xl bg-netly-bg-tertiary/95 backdrop-blur-md border border-white/10 shadow-xl px-4 py-3 min-w-[160px]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">Security Score</span>
        <span className="text-xs text-slate-600 font-mono">{formatTime(ts)}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium" style={{ color }}>
          {getScoreLabel(score)}
        </span>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Score Stat Card
   ========================================================================= */

function ScoreStatCard({ label, value, sub, icon: Icon, trend, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 card-shine"
    >
      <div className="absolute top-0 right-0 w-20 h-20">
        <div className="absolute top-0 right-0 w-10 h-px bg-gradient-to-l from-transparent via-white/15 to-transparent" />
        <div className="absolute top-0 right-0 h-10 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
          <div className={`p-1.5 rounded-lg ${color ? `bg-${color}-500/15` : 'bg-white/5'}`}
            style={color ? { backgroundColor: `${color}15` } : {}}>
            <Icon className="w-4 h-4" style={color ? { color } : {}} />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
          {sub && (
            <span className="text-xs text-slate-500">/ 100</span>
          )}
        </div>
        {sub && (
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Security Analytics Page
   ========================================================================= */

export default function SecurityAnalytics() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/security-history')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      // Normalise timestamps to ISO for JS Date
      const parsed = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        _ts: d.timestamp ? new Date(d.timestamp.replace(' ', 'T')).getTime() : 0,
      }))
      setHistory(parsed)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Compute stats
  const stats = useMemo(() => {
    if (history.length === 0) return null
    const scores = history.map(d => d.score)
    const current = scores[scores.length - 1]
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const first = scores[0]
    const trend = current > first ? 'up' : current < first ? 'down' : 'neutral'
    return { current, highest, lowest, avg, trend, first }
  }, [history])

  // Chart data — parse timestamps
  const chartData = useMemo(() => {
    return history.map(d => ({
      ...d,
      time: d.timestamp ? new Date(d.timestamp.replace(' ', 'T')).getTime() : 0,
      displayTime: formatTime(d.timestamp),
      shortTime: formatShortTime(d.timestamp),
    }))
  }, [history])

  // Color for current score
  const currentColor = stats ? getScoreColor(stats.current) : '#3b82f6'

  // Find dip info for the story
  const dipInfo = useMemo(() => {
    if (history.length < 3) return null
    // Find the lowest point after the first 5 entries
    const relevant = history.slice(5)
    const minEntry = relevant.reduce((min, d) => d.score < min.score ? d : min, relevant[0])
    const maxEntry = history.reduce((max, d) => d.score > max.score ? d : max, history[0])
    return { minEntry, maxEntry }
  }, [history])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-8 w-64 skeleton rounded-lg" />
        <div className="h-4 w-96 skeleton rounded mt-2" />

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-5 space-y-3">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="h-8 w-12 skeleton rounded" />
              <div className="h-3 w-20 skeleton rounded" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-6">
          <div className="h-[400px] skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load security history</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Security Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track security score trends over time with detailed analytics
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Current Score — prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${getScoreBg(stats.current)} border border-white/5 card-shine col-span-2 lg:col-span-1`}
          >
            <div className="absolute top-0 right-0 w-24 h-24">
              <div className="absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
              <div className="absolute top-0 right-0 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Current Score</span>
                <Shield className="w-4 h-4" style={{ color: currentColor }} />
              </div>
              <div className="flex items-baseline gap-1">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold" style={{ color: currentColor }}
                >
                  {stats.current}
                </motion.span>
                <span className="text-sm text-slate-500">/ 100</span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${getScoreLabelColor(stats.current)}`}>
                {getScoreLabel(stats.current)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Latest from {history.length > 0 ? formatTime(history[history.length - 1].timestamp) : '—'}
              </p>
            </div>
          </motion.div>

          <ScoreStatCard
            label="Highest"
            value={stats.highest}
            sub={`From ${history.length} records`}
            icon={ArrowUpRight}
            trend="up"
            color="#22c55e"
            delay={0.08}
          />
          <ScoreStatCard
            label="Lowest"
            value={stats.lowest}
            sub={`Improvement of +${stats.current - stats.lowest}`}
            icon={ArrowDownRight}
            trend={stats.current > stats.lowest ? 'up' : 'down'}
            color={stats.current > stats.lowest ? '#22c55e' : '#ef4444'}
            delay={0.12}
          />
          <ScoreStatCard
            label="Average"
            value={stats.avg}
            sub="Period average"
            icon={Target}
            color="#3b82f6"
            delay={0.16}
          />
          <ScoreStatCard
            label="Trend"
            value={stats.trend === 'up' ? 'Rising' : stats.trend === 'down' ? 'Declining' : 'Stable'}
            sub={`Started at ${stats.first}`}
            icon={stats.trend === 'up' ? TrendingUp : TrendingDown}
            trend={stats.trend}
            color={stats.trend === 'up' ? '#22c55e' : stats.trend === 'down' ? '#ef4444' : '#3b82f6'}
            delay={0.2}
          />
        </div>
      )}

      {/* ── Main Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
      >
        {/* Decorative header glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* Chart header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Score Trend</h3>
            <span className="text-[10px] text-slate-600 font-mono">· {history.length} data points</span>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: currentColor }} />
              <span className="text-slate-500">Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-slate-600" />
              <span className="text-slate-500">Avg: {stats?.avg ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Chart body */}
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <defs>
                {/* Gradient for the area */}
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentColor} stopOpacity={0.35} />
                  <stop offset="50%" stopColor={currentColor} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={currentColor} stopOpacity={0.02} />
                </linearGradient>
                {/* Glow filter for the line */}
                <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid */}
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />

              {/* Axes */}
              <XAxis
                dataKey="time"
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}`
                }}
                tick={{ fill: 'rgba(148,163,184,0.4)', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'rgba(148,163,184,0.4)', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                tickCount={6}
              />

              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }} />

              {/* Area fill */}
              <Area
                type="monotone"
                dataKey="score"
                stroke="none"
                fill="url(#scoreGradient)"
                animationDuration={1500}
                animationEasing="ease-out"
              />

              {/* Main line */}
              <Area
                type="monotone"
                dataKey="score"
                stroke={currentColor}
                strokeWidth={2.5}
                fill="none"
                filter="url(#lineGlow)"
                dot={<GlowDot />}
                activeDot={(props) => {
                  const { cx, cy, payload } = props
                  if (!cx || !cy) return null
                  return (
                    <svg x={cx - 14} y={cy - 14} width={28} height={28}>
                      {/* Outer ring */}
                      <circle cx={14} cy={14} r={12} fill="none" stroke={getScoreColor(payload?.score ?? 0)} strokeWidth="1.5" opacity={0.3} />
                      {/* Inner glow */}
                      <circle cx={14} cy={14} r={6} fill={getScoreColor(payload?.score ?? 0)} opacity={0.8} />
                      {/* Core */}
                      <circle cx={14} cy={14} r={3} fill="#fff" />
                    </svg>
                  )
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer — summary insight */}
        {dipInfo && stats && (
          <div className="border-t border-white/5 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400" />
              Peak: <span className="text-emerald-400 font-semibold">{dipInfo.maxEntry.score}</span>
              <span className="text-slate-600">({formatTime(dipInfo.maxEntry.timestamp)})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              Low: <span className="text-orange-400 font-semibold">{dipInfo.minEntry.score}</span>
              <span className="text-slate-600">({formatTime(dipInfo.minEntry.timestamp)})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-blue-400" />
              Overall:{' '}
              <span className={stats.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                {stats.current - stats.first >= 0 ? '+' : ''}{stats.current - stats.first} pts
              </span>
              <span className="text-slate-600">from start</span>
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Score Distribution Insight Card ── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative rounded-2xl bg-netly-bg-secondary border border-white/5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Radar className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Score Distribution</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { label: 'Excellent', range: '80–100', count: chartData.filter(d => d.score >= 80).length, color: 'emerald', hex: '#22c55e' },
                { label: 'Good', range: '60–79', count: chartData.filter(d => d.score >= 60 && d.score < 80).length, color: 'blue', hex: '#3b82f6' },
                { label: 'Fair', range: '40–59', count: chartData.filter(d => d.score >= 40 && d.score < 60).length, color: 'orange', hex: '#f97316' },
                { label: 'Poor', range: '0–39', count: chartData.filter(d => d.score < 40).length, color: 'red', hex: '#ef4444' },
              ].map(bucket => {
                const pct = chartData.length > 0 ? Math.round((bucket.count / chartData.length) * 100) : 0
                const textColor = `text-${bucket.color}-400`
                const labelClasses = bucket.color === 'emerald' ? 'text-emerald-400'
                  : bucket.color === 'blue' ? 'text-blue-400'
                  : bucket.color === 'orange' ? 'text-orange-400'
                  : 'text-red-400'
                return (
                  <div
                    key={bucket.label}
                    className="relative rounded-xl bg-white/[0.02] border border-white/5 p-4 overflow-hidden"
                  >
                    {/* Fill bar background */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: pct / 100 }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="absolute bottom-0 left-0 right-0 h-full origin-left"
                      style={{ backgroundColor: `${bucket.hex}0D` }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${labelClasses}`}>{bucket.label}</span>
                        <span className="text-lg font-bold text-white">{bucket.count}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{bucket.range} · {pct}% of data</p>
                      <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: bucket.hex }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Clock className="w-3 h-3" />
          Data updates in real-time · {history.length} recorded checkpoints
        </p>
      </motion.div>
    </div>
  )
}
