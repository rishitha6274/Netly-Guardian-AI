// =============================================================================
// Netly Guardian — Reusable API service functions
// All endpoints go through a single fetch wrapper for consistent error handling.
// Designed so that fetch() can be swapped for WebSocket/SSE later.
// =============================================================================

const API_BASE = '/api'

/* ─── Generic fetch wrapper ─────────────────────────────────────────── */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function apiFetch(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    let data
    try { data = await res.json() } catch { data = null }
    throw new ApiError(
      data?.error || `HTTP ${res.status}${data?.message ? ': ' + data.message : ''}`,
      res.status,
      data,
    )
  }
  return res.json()
}

/* ─── GET helpers ───────────────────────────────────────────────────── */

export const fetchDashboard = ()                  => apiFetch('/dashboard')
export const fetchDeviceSummary = ()              => apiFetch('/device-summary')
export const fetchDeviceProfiles = ()             => apiFetch('/device-profiles')
export const fetchDevices = ()                    => apiFetch('/devices')
export const fetchEvents = ()                     => apiFetch('/events')
export const fetchUsage = ()                      => apiFetch('/usage')
export const fetchSecurityAlerts = ()             => apiFetch('/security-alerts')
export const fetchScreenTimeAlerts = ()           => apiFetch('/alerts')
export const fetchCurfewAlerts = ()               => apiFetch('/curfew-alerts')
export const fetchSecurityScore = ()              => apiFetch('/security-score')
export const fetchSecurityHistory = ()            => apiFetch('/security-history')
export const fetchActivity = ()                   => apiFetch('/activity')
export const fetchNotifications = ()              => apiFetch('/notifications')
export const fetchNotificationsUnread = ()        => apiFetch('/notifications/unread-count')
export const fetchBlockedDevices = ()             => apiFetch('/blocked-devices')
export const fetchNotes = ()                      => apiFetch('/notes')
export const fetchTrustScores = ()                => apiFetch('/trust-scores')
export const fetchActions = ()                    => apiFetch('/actions')
export const fetchActionStats = ()                => apiFetch('/action-stats')
export const fetchReport = ()                     => apiFetch('/report')

/* ─── POST helpers ──────────────────────────────────────────────────── */

export const trustDevice = (name, owner, mac) =>
  apiFetch('/trust-device', {
    method: 'POST',
    body: JSON.stringify({ name, owner, mac }),
  })

export const renameDevice = (mac, name) =>
  apiFetch('/rename-device', {
    method: 'POST',
    body: JSON.stringify({ mac, name }),
  })

export const setLimit = (mac, limit) =>
  apiFetch('/set-limit', {
    method: 'POST',
    body: JSON.stringify({ mac, limit }),
  })

export const setCurfew = (mac, start, end) =>
  apiFetch('/set-curfew', {
    method: 'POST',
    body: JSON.stringify({ mac, start, end }),
  })

export const addNote = (mac, note) =>
  apiFetch('/add-note', {
    method: 'POST',
    body: JSON.stringify({ mac, note }),
  })

export const blockDevice = (mac) =>
  apiFetch('/block-device', {
    method: 'POST',
    body: JSON.stringify({ mac }),
  })

export const unblockDevice = (mac) =>
  apiFetch('/unblock-device', {
    method: 'POST',
    body: JSON.stringify({ mac }),
  })

export const restrictDevice = (mac, reason = 'Restricted by administrator') =>
  apiFetch('/restrict-device', {
    method: 'POST',
    body: JSON.stringify({ mac, reason }),
  })

export const unrestrictDevice = (mac) =>
  apiFetch('/unrestrict-device', {
    method: 'POST',
    body: JSON.stringify({ mac }),
  })

export const markNotificationRead = (id) =>
  apiFetch('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })

export const clearNotifications = () =>
  apiFetch('/notifications/clear', {
    method: 'POST',
  })

/* ─── React hook for polling a GET endpoint ─────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useApi(endpoint, options?)
 *
 * Lightweight hook that fetches a GET endpoint on mount and optionally polls.
 *
 * @param {string}   endpoint   - API path (e.g. "/actions")
 * @param {object}   options
 * @param {number}   [options.pollMs=0]  - Polling interval in ms (0 = no poll)
 * @param {boolean}  [options.immediate=true] - Fetch on mount
 * @param {function} [options.transform] - Transform the response data
 * @returns {{ data, loading, error, refresh }}
 */
export function useApi(endpoint, options = {}) {
  const { pollMs = 0, immediate = true, transform } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const raw = await apiFetch(endpoint)
      if (!mountedRef.current) return
      setData(transform ? transform(raw) : raw)
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err.message || 'Request failed')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [endpoint, transform])

  useEffect(() => {
    mountedRef.current = true
    if (immediate) refresh()

    if (pollMs > 0) {
      intervalRef.current = setInterval(refresh, pollMs)
    }

    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refresh, immediate, pollMs])

  return { data, loading, error, refresh }
}
