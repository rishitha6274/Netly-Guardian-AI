import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Monitor, Shield, ShieldCheck, ShieldAlert, Activity, BarChart3,
  Wifi, WifiOff, AlertTriangle, ClipboardList, ChevronLeft,
  ChevronDown, Settings, HelpCircle, Network, Ban, Zap, User, FileText, History,
} from 'lucide-react'

/* ─── Nav group with expand/collapse ────────────────────────────────── */

function NavGroup({ label, icon: Icon, basePath, children, collapsed, defaultOpen = false }) {
  const location = useLocation()
  const isActive = location.pathname === basePath || location.pathname.startsWith(basePath + '/')
  const [open, setOpen] = useState(defaultOpen || isActive)

  // Keep expanded if a child is active
  const shouldBeOpen = isActive || open
  if (isActive && !open) setOpen(true)

  if (collapsed) {
    // In collapsed mode just show the top icon with tooltip
    return (
      <div className="relative group">
        <NavLink to={basePath} end
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''} justify-center px-0`
          }>
          <Icon className="w-5 h-5 sidebar-icon mx-auto" />
        </NavLink>
        <div className="absolute left-full ml-2 px-2 py-1 bg-netly-bg-tertiary rounded text-xs text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Group header */}
      <button
        onClick={() => { setOpen(!open); /* don't navigate, just expand */ }}
        className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
      >
        <Icon className="w-5 h-5 sidebar-icon flex-shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">{label}</span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`group-${label}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-2 pl-3 border-l border-white/5 space-y-0.5 mt-0.5 mb-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Nav item for sub-pages ────────────────────────────────────────── */

function NavItem({ path, label, icon: Icon, collapsed }) {
  if (collapsed) {
    return (
      <div className="relative group">
        <NavLink to={path} end
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''} justify-center px-0`
          }>
          <Icon className="w-5 h-5 sidebar-icon mx-auto" />
        </NavLink>
        <div className="absolute left-full ml-2 px-2 py-1 bg-netly-bg-tertiary rounded text-xs text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </div>
      </div>
    )
  }

  return (
    <NavLink to={path} end
      className={({ isActive }) =>
        `sidebar-item text-sm ${isActive ? 'active' : ''}`
      }>
      <Icon className="w-4 h-4 sidebar-icon flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

/* ─── Main Sidebar ──────────────────────────────────────────────────── */

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-netly-bg-secondary border-r border-white/5 z-30 transition-all duration-300 hidden lg:flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 h-16 border-b border-white/5 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold gradient-text">Netly</span>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">Guardian</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto custom-scrollbar">
        {/* Dashboard */}
        <NavItem path="/app" label="Dashboard" icon={LayoutDashboard} collapsed={collapsed} />

        {/* ─── Devices group ─── */}
        <NavGroup label="Devices" icon={Monitor} basePath="/app/devices" collapsed={collapsed} defaultOpen>
          <NavItem path="/app/devices" label="Total Devices" icon={ClipboardList} collapsed={false} />
          <NavItem path="/app/devices/known" label="Known Devices" icon={Shield} collapsed={false} />
          <NavItem path="/app/devices/unknown" label="Unknown Dev." icon={AlertTriangle} collapsed={false} />
          <NavItem path="/app/devices/inventory" label="Inventory" icon={ClipboardList} collapsed={false} />
          <NavItem path="/app/devices/management" label="Management" icon={Settings} collapsed={false} />
          <NavItem path="/app/devices/profiles" label="Profiles" icon={Shield} collapsed={false} />
          <NavItem path="/app/devices/blocking" label="Blocking" icon={Ban} collapsed={false} />
          <NavItem path="/app/devices/trust-center" label="Trust Center" icon={ShieldCheck} collapsed={false} />
        </NavGroup>

        {/* Network Activity */}
        <NavItem path="/app/network-activity-analytics" label="Network Activity" icon={Network} collapsed={collapsed} />

        {/* Security */}
        <NavItem path="/app/security-score" label="Security Score" icon={Shield} collapsed={collapsed} />
        <NavItem path="/app/security-analytics" label="Analytics" icon={BarChart3} collapsed={collapsed} />

        {/* Live Monitor */}
        <NavItem path="/app/live-monitoring" label="Live Monitor" icon={Activity} collapsed={collapsed} />

        {/* ─── Events group ─── */}
        <NavGroup label="Events" icon={Activity} basePath="/app/events" collapsed={collapsed} defaultOpen>
          <NavItem path="/app/events" label="Recent Events" icon={Activity} collapsed={false} />
          <NavItem path="/app/events/joined" label="Device Joined" icon={Wifi} collapsed={false} />
          <NavItem path="/app/events/left" label="Device Left" icon={WifiOff} collapsed={false} />
        </NavGroup>

        {/* Alerts */}
        <NavItem path="/app/security-alerts" label="Alerts" icon={ShieldAlert} collapsed={collapsed} />
        <NavItem path="/app/auto-enforcement" label="Auto Enforcement" icon={Zap} collapsed={collapsed} />
        <NavItem path="/app/family-controls" label="Family Controls" icon={User} collapsed={collapsed} />
        <NavItem path="/app/action-history" label="Action History" icon={History} collapsed={collapsed} />
        <NavItem path="/app/reports" label="Reports" icon={FileText} collapsed={collapsed} />
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-6 space-y-1.5">
        <NavItem path="/app/settings" label="Settings" icon={Settings} collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`sidebar-item w-full ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>

        {/* Status indicator */}
        {!collapsed && (
          <div className="px-4 py-3 mt-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">All Systems Normal</span>
            </div>
            <p className="text-xs text-slate-500">Network protected</p>
          </div>
        )}
      </div>
    </aside>
  )
}
