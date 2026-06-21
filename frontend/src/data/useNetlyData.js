// =============================================================================
// Netly Guardian — Production API data hook
// Polls all backend endpoints every 30s, merges device + usage data
// =============================================================================

import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api'
const REFRESH_MS = 30000

/* ─── OUI prefix → Vendor lookup ─────────────────────────────────────── */

const VENDOR_DB = {
  '4c:ae:1c': 'TP-Link', 'a4:b5:c6': 'Apple',
  'b4:c5:d6': 'Apple',   'c4:d5:e6': 'Dell',
  'd4:e5:f6': 'Apple',   'e4:f5:a6': 'LG',
  'f4:a5:b6': 'Google',  'a5:b6:c7': 'Samsung',
  '00:11:22': 'Unknown', '11:22:33': 'HP',
  'aa:bb:cc': 'Amazon',  '12:34:56': 'Ring',
  'de:ad:be': 'Unknown',
}

const detectVendor = (mac) => {
  if (!mac) return 'Unknown'
  const macStr = String(mac)
  const prefix = macStr.split(':').slice(0, 3).join(':').toLowerCase()
  return VENDOR_DB[prefix] || 'Unknown'
}

/* ─── Default device type icons ───────────────────────────────────────── */

const TYPE_KEYWORDS = [
  { words: ['router', 'gateway', 'access point'], type: 'router' },
  { words: ['iphone', 'phone', 'pixel', 'galaxy'], type: 'phone' },
  { words: ['laptop', 'macbook', 'notebook', 'thinkpad'], type: 'laptop' },
  { words: ['ipad', 'tablet'], type: 'tablet' },
  { words: ['tv', 'television', 'apple tv', 'roku'], type: 'tv' },
  { words: ['thermostat', 'camera', 'speaker', 'light', 'plug', 'sensor'], type: 'iot' },
]

const detectType = (name) => {
  const lower = String(name || '').toLowerCase()
  for (const entry of TYPE_KEYWORDS) {
    if (entry.words.some(w => lower.includes(w))) return entry.type
  }
  return 'unknown'
}

/* ─── Hook ────────────────────────────────────────────────────────────── */

export function useNetlyData() {
  const [data, setData] = useState({
    devices: [],
    usageMap: {},
    events: [],
    alerts: [],
    stats: {
      totalDevices: 0, knownCount: 0, unknownCount: 0, recentEvents: 0,
      securityScore: 85, securityLevel: null,
      securityUnknownDevices: 0, securityScreenTimeAlerts: 0, securityCurfewAlerts: 0,
      openPorts: [], threatsBlockedThisWeek: 0, unreadAlerts: 0, criticalAlerts: 0,
    },
    loading: true,
    error: null,
  })

  const fetchAll = useCallback(async () => {
    try {
      const [devicesRes, eventsRes, usageRes, alertsRes, dashboardRes, securityRes] = await Promise.all([
        fetch(`${API_BASE}/device-summary`),
        fetch(`${API_BASE}/events`),
        fetch(`${API_BASE}/usage`),
        fetch(`${API_BASE}/alerts`),
        fetch(`${API_BASE}/dashboard`),
        fetch(`${API_BASE}/security-score`),
      ])

      const devicesJson = devicesRes.ok ? await devicesRes.json() : []
      const eventsJson = eventsRes.ok ? await eventsRes.json() : []
      const usageJson = usageRes.ok ? await usageRes.json() : []
      const alertsJson = alertsRes.ok ? await alertsRes.json() : []
      const dashboardJson = dashboardRes.ok ? await dashboardRes.json() : {}
      const securityJson = securityRes.ok ? await securityRes.json() : {}

      // Normalise to arrays
      const rawDevices = Array.isArray(devicesJson) ? devicesJson : []
      const rawAlerts = Array.isArray(alertsJson) ? alertsJson : []

      // Normalise events — backend uses e.event ('device_joined'/'device_left') + e.timestamp
      // Frontend expects e.type ('join'/'leave'), e.label, e.time, e.desc
      const rawEvents = Array.isArray(eventsJson) ? eventsJson.map(e => {
        const type = e.event === 'device_joined' ? 'join'
                   : e.event === 'device_left'  ? 'leave'
                   : e.type || 'info'
        return {
          ...e,
          type,
          label: type === 'join' ? 'Device Joined'
               : type === 'leave' ? 'Device Left'
               : e.label || 'Event',
          time: e.timestamp || e.time,
          desc: e.desc || `Device ${type === 'join' ? 'connected to' : 'disconnected from'} the network`,
        }
      }) : []

      // Build MAC → usage lookup
      // /usage returns an object keyed by MAC address, e.g. {"4c:ae:1c:...": {minutes_online: 956, last_seen: "..."}}
      const usageMap = {}
      if (Array.isArray(usageJson)) {
        usageJson.forEach(u => { if (u.mac) usageMap[u.mac.toLowerCase()] = u })
      } else if (usageJson && typeof usageJson === 'object') {
        Object.entries(usageJson).forEach(([mac, data]) => {
          usageMap[mac.toLowerCase()] = { mac, ...data }
        })
      }

      // Merge usage data into devices + infer vendor/type
      const enrichedDevices = rawDevices.map(d => {
        const usage = usageMap[d.mac] || {}

        // Normalise name — API may return it as { name: "iPhone", owner: "Rishitha" }
        let deviceName = d.name
        if (deviceName && typeof deviceName === 'object') {
          deviceName = deviceName.name || deviceName.device || JSON.stringify(deviceName)
        }
        deviceName = String(deviceName ?? '')

        // Normalise owner — may also be nested
        let deviceOwner = d.owner || usage.owner
        if (deviceOwner && typeof deviceOwner === 'object') {
          deviceOwner = deviceOwner.name || deviceOwner.owner || deviceOwner.username || JSON.stringify(deviceOwner)
        }
        deviceOwner = deviceOwner ? String(deviceOwner) : null

        return {
          ...d,
          name: deviceName,
          owner: deviceOwner,
          type: d.type || detectType(deviceName),
          vendor: d.vendor || detectVendor(d.mac),
          minutesOnline: usage.minutes_online ?? d.minutes_online ?? 0,
          lastSeen: usage.last_seen || d.lastSeen || null,
          screenTimeLimit: usage.limit_minutes ?? usage.screen_time_limit ?? d.screenTimeLimit ?? null,
        }
      })

      // Build MAC → device name lookup for enriching events
      const macToName = {}
      enrichedDevices.forEach(d => {
        if (d.mac) macToName[d.mac.toLowerCase()] = d.name || 'Unknown Device'
      })

      // Enrich events with device name looked up by MAC
      const enrichedEvents = rawEvents.map(e => {
        const deviceName = e.mac
          ? (macToName[e.mac.toLowerCase()] || `Unknown (${e.mac})`)
          : e.device || 'Unknown Device'
        return { ...e, device: deviceName, deviceName }
      })

      const stats = {
        totalDevices: dashboardJson.total_devices ?? enrichedDevices.length,
        knownCount: dashboardJson.known_devices ?? enrichedDevices.filter(d => d.status === 'known').length,
        unknownCount: dashboardJson.unknown_devices ?? enrichedDevices.filter(d => d.status === 'unknown').length,
        recentEvents: dashboardJson.recent_events ?? rawEvents.length,
        // From /security-score API (live), fallback to dashboard or defaults
        securityScore: securityJson.score ?? dashboardJson.security_score ?? 85,
        securityLevel: securityJson.level ?? null,
        securityUnknownDevices: securityJson.unknown_devices ?? 0,
        securityScreenTimeAlerts: securityJson.screen_time_alerts ?? 0,
        securityCurfewAlerts: securityJson.curfew_alerts ?? 0,
        // Defaults for SecurityScore page
        openPorts: dashboardJson.open_ports ?? [53, 80, 443],
        threatsBlockedThisWeek: dashboardJson.threats_blocked_this_week ?? 0,
        unreadAlerts: dashboardJson.unread_alerts ?? 0,
        criticalAlerts: dashboardJson.critical_alerts ?? 0,
      }

      setData({
        devices: enrichedDevices,
        usageMap,
        events: enrichedEvents,
        alerts: rawAlerts,
        stats,
        loading: false,
        error: null,
      })
    } catch (err) {
      setData(prev => ({ ...prev, error: err.message, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, REFRESH_MS)
    return () => clearInterval(interval)
  }, [fetchAll])

  return {
    ...data,
    // Aliases for backward compat with other pages
    enrichedDevices: data.devices,
    networkEvents: data.events,
    recentEvents: data.events,
    refresh: fetchAll,
  }
}
