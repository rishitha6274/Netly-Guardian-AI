import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TotalDevices from './pages/TotalDevices'
import KnownDevices from './pages/KnownDevices'
import UnknownDevices from './pages/UnknownDevices'
import DeviceInventory from './pages/DeviceInventory'
import DeviceManagement from './pages/DeviceManagement'
import DeviceProfiles from './pages/DeviceProfiles'
import DeviceBlocking from './pages/DeviceBlocking'
import DeviceTrustCenter from './pages/DeviceTrustCenter'
import SecurityScore from './pages/SecurityScore'
import SecurityAnalytics from './pages/SecurityAnalytics'
import NetworkActivityAnalytics from './pages/NetworkActivityAnalytics'
import LiveMonitoring from './pages/LiveMonitoring'
import RecentEvents from './pages/RecentEvents'
import DeviceJoined from './pages/DeviceJoined'
import DeviceLeft from './pages/DeviceLeft'
import Alerts from './pages/Alerts'
import NotificationsCenter from './pages/NotificationsCenter'
import AutoEnforcement from './pages/AutoEnforcement'
import FamilyControls from './pages/FamilyControls'
import Reports from './pages/Reports'
import ActionHistory from './pages/ActionHistory'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (require auth) — under /app prefix */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="devices" element={<TotalDevices />} />
              <Route path="devices/known" element={<KnownDevices />} />
              <Route path="devices/unknown" element={<UnknownDevices />} />
              <Route path="devices/inventory" element={<DeviceInventory />} />
              <Route path="devices/management" element={<DeviceManagement />} />
              <Route path="devices/profiles" element={<DeviceProfiles />} />
              <Route path="devices/blocking" element={<DeviceBlocking />} />
              <Route path="devices/trust-center" element={<DeviceTrustCenter />} />
              <Route path="security-score" element={<SecurityScore />} />
              <Route path="network-activity-analytics" element={<NetworkActivityAnalytics />} />
              <Route path="security-analytics" element={<SecurityAnalytics />} />
              <Route path="live-monitoring" element={<LiveMonitoring />} />
              <Route path="events" element={<RecentEvents />} />
              <Route path="events/joined" element={<DeviceJoined />} />
              <Route path="events/left" element={<DeviceLeft />} />
              <Route path="security-alerts" element={<Alerts />} />
              <Route path="notifications-center" element={<NotificationsCenter />} />
              <Route path="auto-enforcement" element={<AutoEnforcement />} />
              <Route path="family-controls" element={<FamilyControls />} />
              <Route path="reports" element={<Reports />} />
              <Route path="action-history" element={<ActionHistory />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
