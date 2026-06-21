// =============================================================================
// Netly Guardian — Mock Data
// Matches backend API format: [{ name, ip, mac, status }]
// =============================================================================

/* --------------------------------------------------------------------------
   Devices — core data matching the scanner API output
   status: "known" | "unknown"
   -------------------------------------------------------------------------- */
export const devices = [
  { name: 'Home Router',       ip: '192.168.1.1',   mac: '4c:ae:1c:35:55:62', status: 'known' },
  { name: "Dad's iPhone",      ip: '192.168.1.100', mac: 'a4:b5:c6:d7:e8:f9', status: 'known' },
  { name: "Mom's MacBook",     ip: '192.168.1.101', mac: 'b4:c5:d6:e7:f8:a9', status: 'known' },
  { name: "Emma's Laptop",     ip: '192.168.1.102', mac: 'c4:d5:e6:f7:a8:b9', status: 'known' },
  { name: "Jake's iPad",       ip: '192.168.1.103', mac: 'd4:e5:f6:a7:b8:c9', status: 'known' },
  { name: 'Living Room TV',    ip: '192.168.1.104', mac: 'e4:f5:a6:b7:c8:d9', status: 'known' },
  { name: 'Smart Thermostat',  ip: '192.168.1.105', mac: 'f4:a5:b6:c7:d8:e9', status: 'known' },
  { name: "Jake's Phone",      ip: '192.168.1.106', mac: 'a5:b6:c7:d8:e9:f0', status: 'known' },
  { name: 'Unknown Device',    ip: '192.168.1.107', mac: '00:11:22:33:44:55', status: 'unknown' },
  { name: 'Guest Laptop',      ip: '192.168.1.108', mac: '11:22:33:44:55:66', status: 'known' },
  { name: 'Smart Speaker',     ip: '192.168.1.109', mac: 'aa:bb:cc:dd:ee:ff', status: 'known' },
  { name: 'Security Camera',   ip: '192.168.1.110', mac: '12:34:56:78:90:ab', status: 'known' },
  { name: 'Rogue Access Point',ip: '192.168.1.200', mac: 'de:ad:be:ef:00:01', status: 'unknown' },
]

/* --------------------------------------------------------------------------
   UI-enriched view of devices (vendor detection, type inference, risk level)
   -------------------------------------------------------------------------- */
const ouiDb = {
  '4c:ae:1c': 'TP-Link',    'a4:b5:c6': 'Apple',
  'b4:c5:d6': 'Apple',      'c4:d5:e6': 'Dell',
  'd4:e5:f6': 'Apple',      'e4:f5:a6': 'LG',
  'f4:a5:b6': 'Google',     'a5:b6:c7': 'Samsung',
  '00:11:22': 'Unknown',    '11:22:33': 'HP',
  'aa:bb:cc': 'Amazon',     '12:34:56': 'Ring',
  'de:ad:be': 'Unknown',
}

const typeKeywords = [
  { words: ['router', 'gateway', 'access point'], type: 'router' },
  { words: ['iphone', 'phone', 'pixel', 'galaxy'], type: 'phone' },
  { words: ['laptop', 'macbook', 'notebook', 'thinkpad'], type: 'laptop' },
  { words: ['ipad', 'tablet'], type: 'tablet' },
  { words: ['tv', 'television', 'apple tv', 'roku'], type: 'tv' },
  { words: ['thermostat', 'camera', 'speaker', 'light', 'plug', 'iot', 'sensor'], type: 'iot' },
]

const detectType = (name) => {
  const lower = name.toLowerCase()
  for (const entry of typeKeywords) {
    if (entry.words.some(w => lower.includes(w))) return entry.type
  }
  return 'unknown'
}

const detectVendor = (mac) => {
  const prefix = mac.split(':').slice(0, 3).join(':').toLowerCase()
  return ouiDb[prefix] || 'Unknown'
}

export const enrichedDevices = devices.map(d => {
  const type = detectType(d.name)
  const vendor = detectVendor(d.mac)
  const isUnknown = d.status === 'unknown'
  return {
    ...d,
    type,
    vendor,
    hostname: d.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    isBlocked: isUnknown,
    riskLevel: isUnknown ? 'suspicious' : 'safe',
    firstSeen: isUnknown
      ? new Date(Date.now() - Math.random() * 7 * 86400000).toISOString()
      : '2026-01-15T08:00:00Z',
    lastSeen: new Date().toISOString(),
    signalStrength: d.status === 'known' ? 75 + Math.floor(Math.random() * 25) : 30 + Math.floor(Math.random() * 30),
    connectionType: d.ip.endsWith('.1') ? 'Ethernet' : 'Wi-Fi 6',
  }
})

/* --------------------------------------------------------------------------
   Security alerts  (derived from device data)
   -------------------------------------------------------------------------- */
let alertId = 0
const nextAlertId = () => `alert-${++alertId}`

const alertTemplates = [
  { type: 'intrusion',  severity: 'critical', template: (d) => `Port scan detected from ${d.ip} (${d.name})` },
  { type: 'anomaly',    severity: 'high',     template: (d) => `Unusual traffic spike from ${d.name} — possible malware` },
  { type: 'blocked',    severity: 'medium',   template: (d) => `Blocked suspicious outbound connection from ${d.name}` },
  { type: 'connection', severity: 'low',      template: (d) => `New device connected: ${d.name} (${d.ip})` },
  { type: 'blocked',    severity: 'high',     template: () => `Multiple failed login attempts from external IP targeting gateway` },
  { type: 'intrusion',  severity: 'medium',   template: (d) => `Unknown device ${d.mac} automatically blocked` },
]

export const alerts = [
  // Generate one alert for each unknown device + a few more
  ...enrichedDevices.filter(d => d.isBlocked).map((d, i) => ({
    id: nextAlertId(),
    type: 'intrusion',
    severity: 'critical',
    message: `Port scan detected from ${d.ip} (${d.name})`,
    ip: d.ip,
    deviceName: d.name,
    timestamp: new Date(Date.now() - (i + 1) * 600000).toISOString(),
    read: i > 0,
  })),
  {
    id: nextAlertId(),
    type: 'anomaly',
    severity: 'high',
    message: "Unusual traffic spike from Jake's iPad — possible malware",
    ip: '192.168.1.103',
    deviceName: "Jake's iPad",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
  {
    id: nextAlertId(),
    type: 'blocked',
    severity: 'medium',
    message: "Blocked website access attempt on Emma's Laptop",
    ip: '192.168.1.102',
    deviceName: "Emma's Laptop",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: nextAlertId(),
    type: 'connection',
    severity: 'low',
    message: 'New device connected: Smart Speaker (192.168.1.109)',
    ip: '192.168.1.109',
    deviceName: 'Smart Speaker',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    read: true,
  },
  {
    id: nextAlertId(),
    type: 'intrusion',
    severity: 'high',
    message: 'Multiple failed login attempts from external IP targeting gateway',
    ip: '192.168.1.1',
    deviceName: 'Home Router',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: nextAlertId(),
    type: 'blocked',
    severity: 'high',
    message: "Suspicious outbound data transfer blocked on Jake's iPad",
    ip: '192.168.1.103',
    deviceName: "Jake's iPad",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false,
  },
  {
    id: nextAlertId(),
    type: 'blocked',
    severity: 'medium',
    message: 'Rogue Access Point (de:ad:be:ef:00:01) automatically quarantined',
    ip: '192.168.1.200',
    deviceName: 'Rogue Access Point',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: false,
  },
]

/* --------------------------------------------------------------------------
   Summary stats
   -------------------------------------------------------------------------- */
export const stats = {
  totalDevices: devices.length,
  knownCount: devices.filter(d => d.status === 'known').length,
  unknownCount: devices.filter(d => d.status === 'unknown').length,
  blockedCount: devices.filter(d => d.status === 'unknown').length,
  unreadAlerts: alerts.filter(a => !a.read).length,
  criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.read).length,
  securityScore: devices.filter(d => d.status === 'known').length / devices.length * 100,
  threatsBlockedThisWeek: 24,
  dataUsedToday: '46.7 GB',
  /** Security Score Card details */
  securityScoreFormatted: '92/100',
  riskLevel: 'low',
  openPorts: [53, 80, 443],
}

/* --------------------------------------------------------------------------
   Threat Summary
   -------------------------------------------------------------------------- */
export const threatSummary = [
  { label: 'Router Secure', status: 'secure', icon: 'check' },
  { label: '1 Unknown Device Found', status: 'warning', icon: 'alert' },
]

/* --------------------------------------------------------------------------
   Network events (for Events pages)
   type: join | leave | unknown
   -------------------------------------------------------------------------- */
export const networkEvents = [
  { time: '21:35', label: 'New Device Joined',        type: 'join',    desc: 'Device authenticated and connected',         device: 'Guest Laptop',       ip: '192.168.1.108' },
  { time: '21:38', label: 'Device Joined',             type: 'join',    desc: 'Device authenticated and connected',         device: 'Smart Speaker',      ip: '192.168.1.109' },
  { time: '21:40', label: 'Device Left Network',        type: 'leave',   desc: 'Device disconnected from network',           device: "Mom's MacBook",      ip: '192.168.1.101' },
  { time: '21:41', label: 'Device Joined',             type: 'join',    desc: 'Device authenticated and connected',         device: 'Security Camera',    ip: '192.168.1.110' },
  { time: '21:42', label: 'Unknown Device Detected',    type: 'unknown', desc: 'Unrecognized MAC address detected',          device: 'Unknown Device',     ip: '192.168.1.107' },
  { time: '21:44', label: 'Device Left Network',        type: 'leave',   desc: 'Device disconnected from network',           device: "Jake's Phone",       ip: '192.168.1.106' },
  { time: '21:45', label: 'New Device Joined',         type: 'join',    desc: 'Device authenticated and connected',         device: 'Living Room TV',     ip: '192.168.1.104' },
  { time: '21:47', label: 'Unknown Device Detected',    type: 'unknown', desc: 'Unrecognized MAC address detected',          device: 'Rogue Access Point', ip: '192.168.1.200' },
  { time: '21:48', label: 'Device Joined',             type: 'join',    desc: 'Device reconnected after brief disconnect',  device: "Mom's MacBook",      ip: '192.168.1.101' },
  { time: '21:50', label: 'Device Left Network',        type: 'leave',   desc: 'Device disconnected from network',           device: 'Smart Thermostat',   ip: '192.168.1.105' },
]

/* --------------------------------------------------------------------------
   Recent events (short list for Live Monitoring page)
   -------------------------------------------------------------------------- */
export const recentEvents = networkEvents.slice(0, 3)

/* --------------------------------------------------------------------------
   Weekly network activity (for Dashboard chart)
   -------------------------------------------------------------------------- */
export const weeklyActivity = [
  { day: 'Mon', hours: 14.2, threats: 3 },
  { day: 'Tue', hours: 18.5, threats: 5 },
  { day: 'Wed', hours: 15.8, threats: 2 },
  { day: 'Thu', hours: 16.3, threats: 7 },
  { day: 'Fri', hours: 17.1, threats: 4 },
  { day: 'Sat', hours: 22.4, threats: 8 },
  { day: 'Sun', hours: 19.0, threats: 6 },
]
