# Netly – Home Security & Family Dashboard

## 1. Concept & Vision

Netly is a premium, human-centered home network security dashboard that transforms complex technical data into simple, actionable insights. It feels like having a friendly security guard who speaks in plain English, protecting your family's digital life. The experience should evoke trust, calm confidence, and modern elegance—not anxiety or confusion.

The personality: **"Your family's digital guardian, explained simply."**

## 2. Design Language

### Aesthetic Direction
Premium dark mode SaaS dashboard with glassmorphism accents, subtle gradients, and a sense of depth. Inspired by modern fintech and health-tech apps—polished, trustworthy, and approachable.

### Color Palette
```
--bg-primary: #0f0f14          /* Deep space black */
--bg-secondary: #1a1a24        /* Card backgrounds */
--bg-tertiary: #252532         /* Elevated surfaces */
--accent-primary: #6366f1      /* Indigo - primary actions */
--accent-secondary: #8b5cf6    /* Violet - secondary accent */
--accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)
--success: #10b981             /* Emerald - safe/online */
--warning: #f59e0b             /* Amber - suspicious */
--danger: #ef4444              /* Red - blocked/critical */
--text-primary: #f8fafc        /* Slate 50 */
--text-secondary: #94a3b8      /* Slate 400 */
--text-muted: #64748b          /* Slate 500 */
--border: rgba(255,255,255,0.08)
--glass: rgba(26, 26, 36, 0.7)
```

### Typography
- **Headings**: "Plus Jakarta Sans" (700, 600) - Modern geometric sans with personality
- **Body**: "Plus Jakarta Sans" (400, 500) - Consistent family for cohesion
- **Monospace accents**: "JetBrains Mono" - For timestamps and technical moments

### Spatial System
- Base unit: 4px
- Section padding: 32px (desktop), 16px (mobile)
- Card padding: 24px
- Gap between cards: 16px
- Border radius: 16px (cards), 12px (buttons), 8px (inputs)

### Motion Philosophy
- **Entrance**: Cards fade up with stagger (opacity 0→1, translateY 20→0, 400ms ease-out, 50ms stagger)
- **Hover**: Subtle lift (translateY -2px) + shadow expansion (200ms ease)
- **Toggles**: Smooth slide with spring physics (cubic-bezier(0.34, 1.56, 0.64, 1))
- **Charts**: Progressive draw-in animation (1000ms ease-out)
- **Alerts**: Slide in from right with gentle bounce
- **Micro-interactions**: Scale on press (0.98), color transitions (150ms)

### Visual Assets
- **Icons**: Lucide React - consistent 24px stroke-width 1.5
- **Decorative**: Gradient orbs in background, subtle noise texture overlay
- **Charts**: Recharts with custom gradient fills matching brand colors

## 3. Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + "Netly" | Search | Notifications | Profile │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Hero Stats: 3 cards (Devices | Alerts | Family)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────┐ ┌───────────────────────┐ │
│  │                             │ │                       │ │
│  │     Devices Grid           │ │   Activity Feed       │ │
│  │     (3 cols → 2 → 1)       │ │   (Human messages)    │ │
│  │                             │ │                       │ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Family View - Usage Chart                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Weekly Summary - Story Card               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Pacing
- Hero stats: High impact, gradient backgrounds, large numbers
- Devices grid: Dense but breathable, consistent card rhythm
- Activity feed: Calmer, list-based, scrollable
- Charts: Full-width, generous padding, smooth curves
- Summary: Story-telling format, friendly tone

### Responsive Strategy
- **Desktop (1280px+)**: 3-column device grid, side-by-side panels
- **Tablet (768px-1279px)**: 2-column grid, stacked panels
- **Mobile (<768px)**: Single column, collapsible sections, bottom navigation

## 4. Features & Interactions

### Dashboard Stats (Hero Section)
Three high-impact metric cards:
1. **Devices Protected**: Count + trend arrow + "All secure" or warning
2. **Alerts This Week**: Count + severity breakdown mini-bar
3. **Family Members Online**: Avatars + count

**Interactions**: 
- Hover: Subtle glow effect, slight lift
- Click: Scrolls to relevant section

### Device Cards
Each device displays:
- Device icon (phone, laptop, TV, IoT, unknown)
- Device name (editable label)
- Status indicator (pulsing green dot = online, gray = offline)
- Risk level badge (Safe/Suspicious)
- Last seen timestamp
- Quick actions: Block/Unblock toggle, Edit label

**Interactions**:
- Hover: Card lifts, shows quick actions
- Click name: Inline edit mode
- Click block toggle: Immediate feedback, optimistic UI
- Long press/right-click: Context menu with more options

**States**:
- Online + Safe: Green accent border
- Online + Suspicious: Amber border + warning icon
- Offline: Muted colors, "Last seen X ago"
- Blocked: Red overlay, blocked icon

### Device Labeling
- Click pencil icon or device name to enter edit mode
- Inline text input with save/cancel
- Pre-suggested labels based on device type
- Custom label support

### Parental Controls Panel
Slide-out or inline panel for selected device:
- **Internet Block Toggle**: Large, friendly toggle switch
- **Time Limits**: 
  - "Bedtime mode" - preset buttons (7PM, 8PM, 9PM, 10PM)
  - "Screen time limit" - hours slider (1-8 hours)
- **Content Filter**: Simple toggle categories (Social, Streaming, Gaming)

### Activity Feed (Alerts Section)
Human-readable messages in chronological order:
- "A new device connected at 2 AM" → "New Device Alert"
- "Someone tried to access blocked website" → "Content Blocked"
- "Dad's laptop connected to the network" → "Device Online"
- "Too many login attempts detected" → "Security Notice"

Each alert shows:
- Icon (color-coded by type)
- Human message
- Time ago
- Quick action if applicable

**Interactions**:
- Swipe to dismiss (mobile)
- Click to expand for details
- Filter by type (All, Security, Activity)

### Family View Chart
Horizontal bar chart showing usage per family member:
- Name + avatar
- Usage hours bar (gradient fill)
- Percentage of total
- Breakdown: Work/School, Entertainment, Social

**Interactions**:
- Hover bar: Tooltip with breakdown
- Click member: Filter activity feed to their devices

### Weekly Summary
Story-style card with friendly summary:
```
"This week, your home network was busy! 
📱 47 devices connected
🔒 12 security attempts blocked  
👨‍👩‍👧‍👦 The kids used screens most on Tuesday

💡 Tip: Consider setting bedtime limits for the children's devices."
```

**Interactions**:
- Refresh button to regenerate (with loading animation)
- Share button (copies text to clipboard)

## 5. Component Inventory

### StatCard
- **Default**: Gradient background, large number, label, icon
- **Hover**: Glow effect, slight lift
- **Loading**: Skeleton pulse animation

### DeviceCard
- **Default**: Dark card, icon, name, status dot, risk badge
- **Hover**: Elevated shadow, visible action buttons
- **Editing**: Name becomes input field with focus ring
- **Blocked**: Red tint overlay, blocked badge
- **Offline**: Muted colors, last seen text
- **Loading**: Skeleton with pulsing icon placeholder

### AlertItem
- **Default**: Icon, message, timestamp, optional action button
- **Unread**: Subtle highlight, bold text
- **Hover**: Background highlight
- **Dismissed**: Slide out animation

### Toggle
- **Off**: Gray track, white knob
- **On**: Gradient track (indigo→violet), white knob with subtle glow
- **Disabled**: Reduced opacity, no interaction
- **Transition**: Spring animation, 200ms

### Button
- **Primary**: Gradient fill, white text
- **Secondary**: Transparent, border, text color
- **Ghost**: No border, text only
- **Hover**: Brightness increase, slight scale
- **Active**: Scale down (0.98)
- **Disabled**: 50% opacity, no pointer

### Avatar
- **Default**: Circular, gradient background, initials or image
- **Group**: Overlapping stack, "+N" indicator
- **Online**: Green ring indicator
- **Offline**: Gray ring

### ProgressBar
- **Default**: Rounded track, gradient fill
- **Animated**: Fill width animates on mount
- **With label**: Percentage text above or inside

### Input
- **Default**: Dark background, subtle border, placeholder text
- **Focus**: Accent border, glow effect
- **Error**: Red border, error message below
- **Filled**: Value displayed, clear button if applicable

## 6. Technical Approach

### Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + custom CSS for animations
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React useState/useContext (no complex state needed)

### Project Structure
```
netly/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx (mobile nav)
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   ├── DeviceCard.jsx
│   │   │   ├── DeviceGrid.jsx
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── AlertItem.jsx
│   │   │   └── FamilyChart.jsx
│   │   ├── controls/
│   │   │   ├── ParentalControls.jsx
│   │   │   ├── TimeLimitPicker.jsx
│   │   │   └── BlockToggle.jsx
│   │   ├── summary/
│   │   │   ├── WeeklySummary.jsx
│   │   │   └── TipCard.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Toggle.jsx
│   │       ├── Avatar.jsx
│   │       ├── Badge.jsx
│   │       └── ProgressBar.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── hooks/
│   │   └── useDeviceStore.js
│   ├── App.jsx
│   │   └── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### Data Model
```javascript
Device {
  id: string
  type: 'phone' | 'laptop' | 'tablet' | 'tv' | 'iot' | 'unknown'
  name: string
  label: string (user-assigned)
  macAddress: string
  ipAddress: string
  status: 'online' | 'offline'
  riskLevel: 'safe' | 'suspicious'
  isBlocked: boolean
  lastSeen: Date
  owner: string (family member id)
  timeLimit?: { enabled: boolean, hours: number }
  bedtimeMode?: { enabled: boolean, time: string }
}

FamilyMember {
  id: string
  name: string
  avatar: string (initials or image)
  color: string (for charts)
  devices: string[] (device ids)
  totalUsage: number (hours this week)
}

Alert {
  id: string
  type: 'security' | 'activity' | 'info'
  message: string (human-readable)
  deviceId?: string
  timestamp: Date
  read: boolean
  action?: { label: string, handler: function }
}
```

### Key Implementation Notes
- Use CSS custom properties for theme colors
- Framer Motion's `AnimatePresence` for enter/exit animations
- Recharts `ResponsiveContainer` for chart responsiveness
- localStorage for persisting device labels and settings
- Optimistic UI updates for toggles (instant feedback)
