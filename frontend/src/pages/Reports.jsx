import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Shield, Clock, Monitor, Download, Eye,
  TrendingUp, TrendingDown, BarChart3, Calendar,
  Activity, Wifi, WifiOff, ShieldAlert, ShieldCheck,
  AlertTriangle, Zap, ChevronDown, Bell,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area,
} from 'recharts'

/* =========================================================================
   Helpers
   ========================================================================= */

const formatMinutes = (m) => {
  if (m == null || m === 0) return '0h'
  if (m < 60) return `${Math.round(m)}m`
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return min > 0 ? `${h}h ${min}m` : `${h}h`
}

const timeAgo = (ts) => {
  if (!ts) return ''
  const d = new Date(ts.replace(' ', 'T'))
  const now = new Date()
  const s = Math.floor((now - d) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getScoreColor = (score) => {
  if (score >= 80) return { hex: '#22c55e', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Excellent' }
  if (score >= 60) return { hex: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Good' }
  if (score >= 40) return { hex: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Fair' }
  return { hex: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', label: 'Poor' }
}

/* =========================================================================
   Stat Card
   ========================================================================= */

function StatCard({ label, value, sub, icon: Icon, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/5 p-4"
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white tabular-nums mt-1">{value}</p>
          {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   Reports Page
   ========================================================================= */

export default function Reports() {
  const [dashboard, setDashboard] = useState(null)
  const [securityHistory, setSecurityHistory] = useState([])
  const [activity, setActivity] = useState(null)
  const [securityScore, setSecurityScore] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [backendReport, setBackendReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [dashRes, histRes, actRes, scoreRes, notifRes, reportRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/security-history'),
        fetch('/api/activity'),
        fetch('/api/security-score'),
        fetch('/api/notifications'),
        fetch('/api/report'),
      ])
      const d = dashRes.ok ? await dashRes.json() : {}
      const h = histRes.ok ? await histRes.json() : []
      const a = actRes.ok ? await actRes.json() : {}
      const s = scoreRes.ok ? await scoreRes.json() : {}
      const n = notifRes.ok ? await notifRes.json() : []
      const r = reportRes.ok ? await reportRes.json() : null

      setDashboard(d)
      setSecurityHistory(Array.isArray(h) ? h : [])
      setActivity(a)
      setSecurityScore(s)
      setNotifications(Array.isArray(n) ? n : [])
      setBackendReport(r)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived data ──
  const currentScore = securityScore?.score ?? dashboard?.security_score ?? 85
  const scoreColor = getScoreColor(currentScore)

  // Group security history by day for chart
  const chartData = useMemo(() => {
    if (securityHistory.length === 0) return []
    const byDay = {}
    securityHistory.forEach(h => {
      if (!h.timestamp) return
      const day = h.timestamp.split(' ')[0]
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(h.score)
    })
    return Object.entries(byDay).map(([day, scores]) => ({
      day: day.slice(5), // MM-DD
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      min: Math.min(...scores),
      max: Math.max(...scores),
    })).slice(-14) // last 14 days
  }, [securityHistory])

  // Compute high/medium/low severity
  const severityCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 }
    notifications.forEach(n => {
      if (counts[n.severity] != null) counts[n.severity]++
    })
    return counts
  }, [notifications])

  const stats = useMemo(() => ({
    totalDevices: dashboard?.total_devices ?? 0,
    knownCount: dashboard?.known_devices ?? 0,
    unknownCount: dashboard?.unknown_devices ?? 0,
    recentEvents: dashboard?.recent_events ?? 0,
    activityCount: activity?.activity_count ?? 0,
    totalJoins: activity?.total_joins ?? 0,
    totalLeaves: activity?.total_leaves ?? 0,
    notifications: notifications.length,
    reportGeneratedAt: backendReport?.generated_at || null,
    reportScore: backendReport?.security_score ?? currentScore,
    reportLevel: backendReport?.security_level ?? scoreColor.label,
    topUsageDevices: backendReport?.top_usage_devices || [],
  }), [dashboard, activity, notifications, backendReport, currentScore, scoreColor.label])

  // ── Loading skeleton ──
  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 skeleton rounded-lg" />
        <div className="h-4 w-72 skeleton rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl bg-netly-bg-secondary border border-white/5 p-4 space-y-2">
              <div className="h-3 w-20 skeleton rounded" /><div className="h-8 w-12 skeleton rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2].map(i => (
            <div key={i} className="rounded-2xl bg-netly-bg-secondary border border-white/5 p-6 space-y-4">
              <div className="h-5 w-40 skeleton rounded" /><div className="h-64 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl bg-netly-bg-secondary border border-red-500/20 p-8 text-center"
      >
        <ShieldAlert className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-sm text-red-300 font-medium">Failed to load reports</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button onClick={fetchData}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors text-sm font-medium"
        >Retry</button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Cinematic Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-white/5 p-6 sm:p-8"
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-teal-400/20 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/10 border border-teal-500/25">
                <BarChart3 className="w-5 h-5 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Reports</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                Analytics
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 ml-1">
              Security summaries, network activity analytics, and device health reports
            </p>
          </div>
          <button onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
          >
            <Clock className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatCard label="Total Reports" value={chartData.length} sub="Days of data" icon={FileText} color="text-teal-400" bg="bg-teal-500/10" delay={0.05} />
          <StatCard label="Security Score" value={`${currentScore}/100`} sub={scoreColor.label} icon={Shield} color={scoreColor.text} bg={scoreColor.bg} delay={0.1} />
          <StatCard label="Network Events" value={stats.recentEvents} sub="Total recorded" icon={Activity} color="text-blue-400" bg="bg-blue-500/10" delay={0.15} />
          <StatCard label="Devices" value={stats.totalDevices} sub={`${stats.knownCount} known · ${stats.unknownCount} unknown`} icon={Monitor} color="text-violet-400" bg="bg-violet-500/10" delay={0.2} />
        </div>
      </motion.div>

      {/* ── Activity Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Activity Count" value={stats.activityCount} icon={Activity} color="text-blue-400" bg="bg-blue-500/10" delay={0.08} />
        <StatCard label="Joins" value={stats.totalJoins} icon={Wifi} color="text-emerald-400" bg="bg-emerald-500/10" delay={0.1} />
        <StatCard label="Leaves" value={stats.totalLeaves} icon={WifiOff} color="text-slate-400" bg="bg-slate-500/10" delay={0.12} />
        <StatCard label="Notifications" value={stats.notifications} icon={Bell} color="text-amber-400" bg="bg-amber-500/10" delay={0.14} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Security Score History Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Security Score Trend</h3>
            {chartData.length > 0 && (
              <span className="text-[10px] text-slate-500 ml-auto">
                Latest: {chartData[chartData.length - 1]?.score ?? '—'}
              </span>
            )}
          </div>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-slate-600">No history data available yet</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#scoreGradient)" strokeWidth={2} animationDuration={1000} name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 bg-netly-bg-secondary border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Notification Severity</h3>
            <span className="text-[10px] text-slate-500 ml-auto">{notifications.length} total</span>
          </div>

          {notifications.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-slate-600">No notifications recorded</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'High', count: severityCounts.high, fill: '#ef4444' },
                  { name: 'Medium', count: severityCounts.medium, fill: '#f97316' },
                  { name: 'Low', count: severityCounts.low, fill: '#3b82f6' },
                ]}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Report Cards (generated from data) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-400" />
          Generated Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Security Report */}
          <ReportCard
            title="Security Overview"
            type="security"
            period="Current"
            score={currentScore}
            previousScore={securityHistory.length > 1 ? securityHistory[securityHistory.length - 2]?.score : currentScore}
            summary={`${stats.totalDevices} devices on network · ${stats.knownCount} known · ${stats.unknownCount} unknown · ${stats.recentEvents} events recorded`}
            isOpen={selectedReport === 'security'}
            onToggle={() => setSelectedReport(selectedReport === 'security' ? null : 'security')}
            details={[
              { label: 'Security Score', value: `${currentScore}/100` },
              { label: 'Unknown Devices', value: stats.unknownCount },
              { label: 'Total Events', value: stats.recentEvents },
            ]}
          />

          {/* Activity Report */}
          <ReportCard
            title="Network Activity"
            type="activity"
            period="Current"
            score={Math.min(100, Math.round((stats.totalJoins / (stats.totalJoins + stats.totalLeaves || 1)) * 100))}
            previousScore={50}
            summary={`${stats.activityCount} activity events · ${stats.totalJoins} joins · ${stats.totalLeaves} leaves`}
            isOpen={selectedReport === 'activity'}
            onToggle={() => setSelectedReport(selectedReport === 'activity' ? null : 'activity')}
            details={[
              { label: 'Activity Count', value: stats.activityCount },
              { label: 'Joins', value: stats.totalJoins },
              { label: 'Leaves', value: stats.totalLeaves },
            ]}
          />

          {/* Notifications Report */}
          <ReportCard
            title="Notifications Summary"
            type="notifications"
            period="Current"
            score={Math.max(0, 100 - severityCounts.high * 15)}
            previousScore={85}
            summary={`${notifications.length} total notifications · ${severityCounts.high} high · ${severityCounts.medium} medium · ${severityCounts.low} low`}
            isOpen={selectedReport === 'notifications'}
            onToggle={() => setSelectedReport(selectedReport === 'notifications' ? null : 'notifications')}
            details={[
              { label: 'Total', value: notifications.length },
              { label: 'High Severity', value: severityCounts.high },
              { label: 'Medium Severity', value: severityCounts.medium },
              { label: 'Low Severity', value: severityCounts.low },
            ]}
          />

          {/* Devices Report */}
          <ReportCard
            title="Device Health"
            type="devices"
            period="Current"
            score={stats.unknownCount === 0 ? 100 : Math.max(0, 100 - stats.unknownCount * 25)}
            previousScore={90}
            summary={`${stats.totalDevices} total devices · ${stats.knownCount} known · ${stats.unknownCount} unknown`}
            isOpen={selectedReport === 'devices'}
            onToggle={() => setSelectedReport(selectedReport === 'devices' ? null : 'devices')}
            details={[
              { label: 'Total Devices', value: stats.totalDevices },
              { label: 'Known', value: stats.knownCount },
              { label: 'Unknown', value: stats.unknownCount },
            ]}
          />

          {/* Backend-Generated Report */}
          {backendReport && (
            <ReportCard
              title="System Report"
              type="report"
              period={stats.reportGeneratedAt ? `Generated ${stats.reportGeneratedAt}` : 'Latest'}
              score={stats.reportScore}
              previousScore={currentScore}
              summary={`${stats.totalDevices} devices · ${stats.recentEvents} events · Level: ${stats.reportLevel}`}
              isOpen={selectedReport === 'report'}
              onToggle={() => setSelectedReport(selectedReport === 'report' ? null : 'report')}
              details={[
                { label: 'Score', value: `${stats.reportScore}/100` },
                { label: 'Level', value: stats.reportLevel },
                { label: 'Devices', value: stats.totalDevices },
                { label: 'Events', value: stats.recentEvents },
                ...(stats.topUsageDevices.length > 0
                  ? stats.topUsageDevices.slice(0, 3).map(([mac, info], i) => ({
                      label: `#${i + 1} Usage`,
                      value: `${info.minutes_online || 0}m`,
                    }))
                  : []),
              ]}
            />
          )}
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-center pt-4 pb-4 border-t border-white/5"
      >
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Activity className="w-3 h-3" />
          Reports are generated in real-time from live network data
        </p>
      </motion.div>
    </div>
  )
}

/* =========================================================================
   Report Card Component
   ========================================================================= */

const REPORT_ICONS = {
  security: Shield,
  activity: Activity,
  notifications: Bell,
  devices: Monitor,
  report: FileText,
}

const REPORT_COLORS = {
  security: 'text-red-400',
  activity: 'text-blue-400',
  notifications: 'text-amber-400',
  devices: 'text-emerald-400',
  report: 'text-teal-400',
}

const REPORT_BGS = {
  security: 'bg-red-500/10',
  activity: 'bg-blue-500/10',
  notifications: 'bg-amber-500/10',
  devices: 'bg-emerald-500/10',
  report: 'bg-teal-500/10',
}

function ReportCard({ title, type, period, score, previousScore, summary, isOpen, onToggle, details }) {
  const Icon = REPORT_ICONS[type] || FileText
  const color = REPORT_COLORS[type] || 'text-slate-400'
  const bg = REPORT_BGS[type] || 'bg-slate-500/10'
  const scoreDiff = score - previousScore

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl p-5 bg-netly-bg-secondary border border-white/5 hover:border-teal-500/20 transition-all cursor-pointer group"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-[10px] text-slate-500">{period}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-lg font-bold ${scoreDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500">/100</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px]">
          {scoreDiff >= 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={scoreDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {scoreDiff > 0 ? '+' : ''}{scoreDiff} pts
          </span>
          <span className="text-slate-600 ml-0.5">from baseline</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Expanded details */}
      {isOpen && details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/5"
        >
          <div className="grid grid-cols-3 gap-2">
            {details.map((d, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/5 text-center">
                <p className="text-[10px] text-slate-500">{d.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
