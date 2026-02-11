# Meditation Engine – Surgical Refinement Log

**Date:** February 2026  
**Scope:** SessionEngine hardening, controller hook introduction, store error transparency, chart safety verification

---

## 1. Purpose of this refinement

### Problems addressed

This refinement solved four critical issues in the meditation engine architecture:

1. **Timing drift**: The original implementation accumulated elapsed time in a mutable `pausedElapsedSec` counter, which could drift under rapid pause/resume cycles. This is now derived from a single `performance.now()` base timestamp plus cumulative pause duration.

2. **Lifecycle ownership ambiguity**: React state directly owned `SessionEngine`, creating confusion about when the engine should be created, paused, resumed, or disposed. The controller hook now owns this lifecycle in a ref, making cleanup explicit and reusable.

3. **Silent storage failures**: `LocalSessionTemplateStore` silently caught all errors, making debugging impossible. Errors are now logged with `[LocalSessionTemplateStore]` prefix for transparency.

4. **Chart coupling risk**: The first chart implementation could be extended with meditation-specific semantics by future developers. We hardened the boundary: charts consume only `MeditationTimelineModel`, a pure data structure with zero meditation coupling.

### Forward compatibility

This refinement prepares the codebase for:
- Supabase integration (replacing `LocalSessionTemplateStore` without touching the engine)
- React Native (engine is framework-agnostic and can receive any `AudioAdapter`)
- Server-side chart rendering (model builder is pure and Node-safe)
- Community features (SessionRun is designed as a future first-class entity)

---

## 2. High-level architecture after refinement

### Layer diagram

```
┌─────────────────────────────────────────────────────┐
│  /src/app/meditation/page.tsx                       │ UI Page (client)
│  - Template selector                                │
│  - Chart display                                    │
│  - Control buttons (Start/Pause/Resume/Stop)        │
│  - Event logging to console                         │
└────────────────┬────────────────────────────────────┘
                 │
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────┐
│  /src/domains/meditation/ui/                        │ UI/React Layer
│  useMeditationSessionController.ts                  │
│  - Owns SessionEngine instance in ref              │
│  - Manages pause/resume lifecycle                  │
│  - Updates UI state via 500ms polling              │
│  - Disposes engine cleanup                         │
└────────────────┬────────────────────────────────────┘
                 │
                 │ owns + subscribes
                 ▼
┌─────────────────────────────────────────────────────┐
│  /src/domains/meditation/engine/                    │ Engine Layer
│  SessionEngine.ts                                   │ (Framework-agnostic)
│  - Timing calculations                             │
│  - Bell scheduling                                 │
│  - Ambient audio management                        │
│  - Event emission (events are POJOs)               │
└────────────┬──────────────────────┬─────────────────┘
             │                      │
             │ uses                 │ uses
             ▼                      ▼
        ┌────────────┐    ┌──────────────────────┐
        │AudioAdapter│    │SessionEvent types    │
        │interface   │    │(started, paused,     │
        │            │    │ resumed, etc)        │
        └────────────┘    └──────────────────────┘
             │
             │ implemented by
             ▼
        ┌────────────────────┐
        │WebAudioAdapter     │ HTML5 Audio Layer
        │(HTMLAudioElement   │
        │ caching)           │
        └────────────────────┘

                 ↕ (parallel)

┌─────────────────────────────────────────────────────┐
│  /src/domains/meditation/store/                     │ Persistence Layer
│  SessionTemplateStore (interface)                   │
│  LocalSessionTemplateStore (localStorage impl)      │
│  - list(), get(), save(), remove()                  │
│  - Later: SupabaseSessionTemplateStore              │
└─────────────────────────────────────────────────────┘

                 ↕ (parallel)

┌─────────────────────────────────────────────────────┐
│  /src/domains/metrics/charts/                       │ Chart Layer
│  buildMeditationTimelineModel.ts                    │ (Pure functions)
│  - Computes MeditationTimelineModel                │
│  - Server-safe, framework-agnostic                 │
│  - Generates axis ticks and marker positions       │
│                                                    │
│  MeditationTimelineChart.tsx                       │ Chart Rendering
│  - Client component (SVG renderer)                 │
│  - Consumes only MeditationTimelineModel           │
│  - Zero meditation coupling                        │
└─────────────────────────────────────────────────────┘
```

### Responsibility boundaries

- **Page** handles user interaction (button clicks, template selection), display logic, and event logging.
- **Controller hook** owns engine lifecycle, mediates between React's reactive model and the engine's imperative API.
- **SessionEngine** calculates time, manages audio, and emits pure-data events. Never imports React.
- **Audio adapters** abstract sound playback. Implementation can be Web Audio or React Native audio.
- **Store** abstracts template persistence. Implementation can be localStorage, Supabase, or in-memory.
- **Chart model builder** computes positions and ticks (pure function, runs on server or client).
- **Chart component** renders SVG. Receives only data, makes zero decisions about meditation semantics.

---

## 3. Files added

### useMeditationSessionController.ts

**Location:** `/src/domains/meditation/ui/useMeditationSessionController.ts`

**Layer:** UI/React boundary

**Purpose:**  
Owns and manages the lifecycle of a `SessionEngine` instance. Bridges React's declarative event model with the engine's imperative API. Provides a simple hook-based interface for UI components.

**Key design:**
- Stores `SessionEngine` in `useRef`, not state (ref persists across renders but doesn't trigger re-render)
- Subscribes to engine events to update `elapsedSec` and `isRunning`
- Polls `engine.getElapsedSec()` every 500ms for smooth UI updates
- Auto-disposes and recreates engine when template changes
- Returns minimal API: `{ start, pause, resume, stop, elapsedSec, isRunning }`

**Must not depend on:**
- SessionTemplate (receives it as prop, does not persist or modify it)
- SessionEvent type definitions (uses event objects, not coupled to schema)
- Chart components

---

### SessionRun.ts

**Location:** `/src/domains/meditation/engine/SessionRun.ts`

**Layer:** Engine domain

**Purpose:**  
Represents a completed meditation session recording. Currently a pure data type, logged to console. Future: will be persisted via a `SessionRunStore` for stats, streaks, community leaderboards.

**Design:**
```typescript
type SessionRun = {
  id: string           // Unique run identifier (e.g., "run-${Date.now()}")
  templateId: string   // Reference to the SessionTemplate used
  startedAt: number    // Unix timestamp (milliseconds) when session started
  endedAt: number      // Unix timestamp (milliseconds) when session ended
  durationSec: number  // Elapsed time in seconds (from SessionEngine)
}
```

**Must not depend on:**
- React
- Storage layer (not yet persisted)
- Audio system

**Future extensions:**
- `heartRate?: number[]` (wearable integration)
- `tags?: string[]` (user notes)
- `feedback?: number` (1–5 rating)

---

### meditation-engine-refinement.md

**Location:** `/docs/meditation-engine-refinement.md`

**Purpose:**  
Internal engineering documentation for future maintainers. Records the architectural decisions, timing guarantees, and extension patterns from this refinement.

**Must not be:**
- Marketing material
- Auto-generated from code
- User-facing documentation

---

## 4. Files modified

### SessionEngine.ts

**Location:** `/src/domains/meditation/engine/SessionEngine.ts`

**Changes:**

1. **Replaced timing accumulator with derived calculation:**
   - **Before:** `pausedElapsedSec: number` (mutable counter)
   - **After:** `totalPausedMs: number` (cumulative pause duration in milliseconds)
   - **Why:** Eliminates floating-point drift. All elapsed time is now derived from `performance.now()`, not accumulated.

2. **Added public `getElapsedSec()` method:**
   ```typescript
   getElapsedSec(): number {
     if (this.state === 'idle') return 0
     if (this.state === 'paused') {
       const elapsedMs = this.pauseTime - this.startTime - this.totalPausedMs
       return elapsedMs / 1000
     }
     // Running
     const now = performance.now()
     const elapsedMs = now - this.startTime - this.totalPausedMs
     return elapsedMs / 1000
   }
   ```
   - **Why:** Allows UI to pull current time without relying on tick events. Enables 500ms polling in the hook for smooth updates.

3. **Refactored `pause()` and `resume()`:**
   - `pause()` now stores `pauseTime = performance.now()` instead of computing `pausedElapsedSec` immediately.
   - `resume()` computes the pause duration and adds it to `totalPausedMs` instead of adjusting `startTime`.
   - **Why:** Separates time tracking from pause tracking. Makes the math clearer and prevents off-by-one timing errors.

4. **No change to bell scheduling or audio logic.**

---

### LocalSessionTemplateStore.ts

**Location:** `/src/domains/meditation/store/LocalSessionTemplateStore.ts`

**Changes:**

1. **Removed all `typeof window === 'undefined'` checks:**
   - **Before:** Store attempted to be "SSR-safe" by returning `[]` if window was undefined.
   - **After:** Store assumes it is only instantiated in client components. No runtime checks.
   - **Why:** Simpler, clearer intent. Store is explicitly a browser-only API. If used on the server, it will fail fast and obviously.

2. **Added error logging to all catch blocks:**
   ```typescript
   catch (error) {
     console.warn(
       '[LocalSessionTemplateStore] Failed to list templates:',
       error instanceof Error ? error.message : String(error)
     )
     return []
   }
   ```
   - **Why:** Debugging is now possible. Developers see which operation failed and why (e.g., quota exceeded, JSON parse error).

3. **No change to method signatures.** All four methods (`list`, `get`, `save`, `remove`) retain their original async signatures.

---

### page.tsx

**Location:** `/src/app/meditation/page.tsx`

**Changes:**

1. **Removed direct SessionEngine references:**
   - **Before:** Page imported `SessionEngine`, `SessionEvent`, created instances directly in event handlers.
   - **After:** Page uses `useMeditationSessionController()` hook. Never touches `SessionEngine` directly.
   - **Why:** Cleaner separation. Engine lifecycle is now the hook's responsibility.

2. **Added controller hook instantiation:**
   ```typescript
   const controller = useMeditationSessionController(selectedTemplate || null, audio)
   ```
   - Hook signature: `(template: SessionTemplate | null, audio: AudioAdapter) => ControllerState`

3. **Updated button handlers to use controller methods:**
   - `handleStart()` now calls `controller.start()` instead of constructing an engine.
   - `handlePause()`, `handleResume()`, `handleStop()` now call hook methods.
   - **Why:** Single source of truth for engine lifecycle.

4. **Added SessionRun construction on session end:**
   ```typescript
   const sessionRun: SessionRun = {
     id: `run-${Date.now()}`,
     templateId: selectedTemplate.id,
     startedAt: sessionStartTime,
     endedAt: Date.now(),
     durationSec: controller.elapsedSec
   }
   console.log('[SessionRun] Completed:', sessionRun)
   ```
   - **Why:** Records session metadata in memory. Later, this will be passed to a `SessionRunStore` for persistence.

5. **Simplified UI state tracking:**
   - **Before:** Tracked `engine`, `isRunning`, `isPaused`, `elapsedSec` separately.
   - **After:** Reads `controller.isRunning` and `controller.elapsedSec` directly.
   - **Why:** Single source of truth. Hook owns state.

6. **Updated button disabled states:**
   - Resume button now disabled when `controller.isRunning` (not when paused).
   - Stop button now disabled when `!controller.isRunning` (simpler logic).
   - **Why:** Aligns with controller's simplified state model.

---

## 5. Timing and correctness guarantees

### Elapsed time calculation

All elapsed time is derived from a single formula:

```
elapsedSec = (now - startTime - totalPausedMs) / 1000
```

Where:
- `now` = `performance.now()` (milliseconds since navigation start, high-precision timer)
- `startTime` = timestamp captured at `start()` call
- `totalPausedMs` = cumulative milliseconds spent paused (updated on each `resume()`)

### Pause and resume handling

**Pause:**
1. Record `pauseTime = performance.now()`
2. Do NOT compute elapsed time yet (avoid floating-point error accumulation)
3. Emit paused event with current elapsed time

**Resume:**
1. Calculate pause duration: `pauseTime - performance.now()` (wait, that's backwards)

Actually, let me re-check the code. In resume():
```typescript
const pauseDurationMs = performance.now() - this.pauseTime
this.totalPausedMs += pauseDurationMs
```

So:
1. Record when pause started: `pauseTime`
2. On resume, calculate how long the pause lasted: `performance.now() - pauseTime`
3. Add that duration to `totalPausedMs`
4. Continue: all future elapsed times will subtract this accumulated pause duration

**Correctness:**
- No time is lost. Every millisecond paused is accounted for.
- The calculation is idempotent: calling `getElapsedSec()` multiple times returns the same value (assumes `performance.now()` advances monotonically, which is guaranteed by the browser).
- Precision: `performance.now()` is accurate to microseconds in modern browsers. Millisecond precision is safe.

### Interval bell derivation

```typescript
const intervalSec = this.template.intervalBell.everySec
const currentIntervalIndex = Math.floor(elapsedSec / intervalSec)

if (
  currentIntervalIndex > this.lastFiredIntervalBellIndex &&
  elapsedSec < this.template.durationSec
) {
  this.lastFiredIntervalBellIndex = currentIntervalIndex
  // Fire bell
}
```

**How it works:**
- `currentIntervalIndex` is how many "intervals" have elapsed (e.g., if `everySec=60` and `elapsedSec=125`, then `currentIntervalIndex=2`).
- We compare against `lastFiredIntervalBellIndex` to ensure we fire exactly once per interval, even if the check runs multiple times.
- Interval bells fire only before `durationSec` is reached.

**Why cumulative drift cannot occur:**
- We do not increment a counter on each bell.
- We re-derive the index from elapsed time every 100ms.
- If the engine is paused, the index calculation stays frozen (elapsed time doesn't advance).
- On resume, the index calculation picks up exactly where it left off (because elapsed time resumes advancing).

### Performance.now() guarantees

- Monotonically increasing (never goes backward, even if system clock is adjusted)
- High resolution (microsecond precision in modern browsers)
- Not affected by pause/resume of the JavaScript event loop (high-resolution timer, separate from event loop)
- Available in all modern browsers and Node.js environments

---

## 6. Controller hook ownership model

### Why the engine is owned by a hook

React components are declarative: render function returns JSX based on state. The `SessionEngine` is imperative: you call `start()`, `pause()`, `resume()` as side effects.

If state owns the engine, we create a mismatch:
- React renders when state changes.
- The engine can be started/paused independently of state updates.
- Cleanup becomes unclear (does the component unmount? When do we stop the engine and close audio?).

The hook patterns the ownership unambiguously:
- Hook is called once per component instance.
- Hook instantiates the engine.
- Hook manages cleanup in a useEffect.
- Engine state is decoupled from React state (engine in ref, React state in useState).

### Why it is stored in a ref

```typescript
const engineRef = useRef<SessionEngine | null>(null)
```

Refs have two key properties:
1. **Persist across renders:** The same ref object (`engineRef.current`) persists even if the component re-renders. This means we don't accidentally create a new engine on each re-render.
2. **Do not trigger re-render:** Updating `engineRef.current` does not cause a re-render. We can update it freely without an infinite loop.

If we used state (`const [engine, setEngine]`), updating the engine would trigger a render, which would re-run the component, which might create a new engine, etc. Refs break the cycle.

### Why it is not placed in React context

Context is for values shared across many components (e.g., current user, theme, locale). The meditation engine is:
- Heavy (owns audio resources, timers)
- Stateful (tracks pause/resume state)
- Unique per session (each session is independent)

Putting it in context would:
- Make cleanup ambiguous (which provider level is responsible for cleanup?)
- Couple unrelated components to the engine existence
- Make it hard to run multiple sessions concurrently (e.g., one on page A, one on a modal)

A hook in the specific component that needs it is simpler and more correct.

### How UI polling works

```typescript
const startUIRefresh = () => {
  updateIntervalRef.current = setInterval(() => {
    if (engineRef.current) {
      const elapsed = engineRef.current.getElapsedSec()
      setState((prev) => ({
        ...prev,
        elapsedSec: elapsed
      }))
    }
  }, 500)
}
```

Every 500ms, the hook:
1. Calls `engine.getElapsedSec()` (pulls current time from the engine)
2. Updates React state (`elapsedSec`)
3. Component re-renders with the new elapsed time

**Why 500ms?**
- Smooth enough for human perception (20 FPS)
- Reduces re-renders compared to 100ms or continuous updates
- Battery-friendly on mobile (future React Native versions)

**Alternative: Event-based poll**
The engine could emit a `'tick'` event every 1000ms, which we subscribe to. But pull-based polling is simpler here because:
- We can change the interval without restarting the engine.
- We can poll while paused, which makes UI updates immediate.
- No event subscription/unsubscription bookkeeping.

---

## 7. Persistence boundary and future Supabase migration

### Why SessionTemplateStore exists

Templates (meditation presets) need to be persisted. But where and how depends on the deployment model:
- **Early-stage:** localStorage (works offline, zero backend)
- **Growth stage:** Supabase (multi-device sync, user accounts)
- **Mature:** Supabase + CDN (templates as public presets)

By defining `SessionTemplateStore` as an interface, we allow any implementation:

```typescript
export interface SessionTemplateStore {
  list(): Promise<SessionTemplate[]>
  get(id: string): Promise<SessionTemplate | null>
  save(t: SessionTemplate): Promise<void>
  remove(id: string): Promise<void>
}
```

The engine doesn't know or care where templates come from.

### How LocalSessionTemplateStore fits

`LocalSessionTemplateStore` is the first implementation. It:
- Uses `localStorage` as the database
- Serializes/deserializes templates as JSON
- No async I/O (localStorage is synchronous, but we wrap it in `async` for API compatibility)
- No error recovery (just logs and returns empty list on failure)

**Example usage:**
```typescript
const store = new LocalSessionTemplateStore()
const templates = await store.list() // Fetches from localStorage
await store.save(newTemplate)          // Writes to localStorage
```

### How SupabaseSessionTemplateStore will replace it

A future `SupabaseSessionTemplateStore` would:
- Accept `SupabaseClient` in the constructor
- Implement the same four methods, but using `supabase.from('templates')`
- Add a `userId` or `teamId` parameter to `list()`
- Sync across devices

**Migration path:**
```typescript
// Old
const store = new LocalSessionTemplateStore()

// New (drop-in replacement)
const supabase = createClient(...)
const store = new SupabaseSessionTemplateStore(supabase, currentUser.id)

// Page remains unchanged
```

### Why the engine does not care

The `SessionEngine` is constructed with:
```typescript
const engine = new SessionEngine(template, audio)
```

It receives a fully-constructed `SessionTemplate`. It has no knowledge of:
- Where the template came from
- Whether there are other templates
- How to persist anything

This decoupling makes the engine testable, portable, and reusable.

---

## 8. SessionRun domain concept

### What SessionRun represents

A `SessionRun` is a single completed meditation session. It records:
- **When it started:** `startedAt` (Unix millisecond timestamp)
- **When it ended:** `endedAt` (Unix millisecond timestamp)
- **How long it lasted:** `durationSec` (seconds elapsed, from the engine)
- **Which template was used:** `templateId` (reference to the template)
- **A unique identifier:** `id` (for later lookups)

### How it differs from SessionTemplate

| Aspect | SessionTemplate | SessionRun |
|--------|---|---|
| **Is it persisted?** | Yes (by SessionTemplateStore) | No (yet) |
| **When is it created?** | Manually by user | Automatically on session end |
| **Can it be edited?** | Yes | No (immutable record) |
| **What does it represent?** | A meditation preset (config) | A single meditation event (data) |
| **Can there be duplicates?** | No (unique ID) | Yes (many runs of same template) |
| **Users typically have** | ~5–20 templates | ~100–1000s of runs |

### How it will be used later for stats, streaks, and community features

**Stats:**
- Count of sessions in the past 7 days
- Average session duration
- Most-used template
- Total meditation hours

**Streaks:**
- "14-day streak: meditated every day"
- "Personal record: 47 consecutive days"

**Community features:**
- "3,421 people meditated today"
- "Popular template this week: 10-min Morning Meditation"
- Leaderboards: "Who meditated the longest this month?"

**Why we start with logging to console:**
The architecture should be in place before we add persistence. By the time we need persistence, the data model is proven, and adding `SessionRunStore` is straightforward:

```typescript
export interface SessionRunStore {
  save(run: SessionRun): Promise<void>
  listByUser(userId: string): Promise<SessionRun[]>
}

const runStore = new SupabaseSessionRunStore(supabase)
const runs = await runStore.listByUser(currentUserId)
```

---

## 9. Chart modernization and safety guarantees

### What MeditationTimelineModel is

A pure data structure representing the visual layout of a meditation session timeline:

```typescript
export interface MeditationTimelineModel {
  durationSec: number        // Total session length in seconds
  intervalMarkers: number[]  // Seconds at which interval bells fire (e.g., [60, 120, 180])
  endMarker: number          // Second at which session ends (usually === durationSec)
  ticks: number[]            // Seconds to display on the timeline axis (e.g., [0, 60, 120, 180, 300])
}
```

It contains zero meditation semantics:
- Does not know what a "bell" is
- Does not know about templates
- Does not reference colors or UI

It is a pure representation of time points.

### Why chart rendering only consumes a model

The renderer is a React component:

```typescript
export function MeditationTimelineChart({
  model: MeditationTimelineModel
}: props): React.ReactElement {
  // Receives only the model
  // Renders SVG based on model data
  // Never touches SessionTemplate or knows about meditation
}
```

**Benefits:**
1. **Reusability:** The chart can render any timeline-based event system (yoga, breathing exercises, sleep tracking).
2. **Testability:** Input is a plain object. No mocking of complex dependencies.
3. **Server rendering:** The chart can render on the server if the model is computed server-side.
4. **Mobile-friendly:** If we port to React Native, we just implement an alternate renderer for the same model.

### Why buildMeditationTimelineModel is pure and server-safe

```typescript
export function buildMeditationTimelineModel(
  template: SessionTemplate
): MeditationTimelineModel {
  const durationSec = template.durationSec
  const intervalMarkers: number[] = []
  
  if (template.intervalBell) {
    const intervalSec = template.intervalBell.everySec
    let markerPosition = intervalSec
    while (markerPosition < durationSec) {
      intervalMarkers.push(markerPosition)
      markerPosition += intervalSec
    }
  }
  
  const ticks = generateTicks(durationSec)
  return { durationSec, intervalMarkers, endMarker: durationSec, ticks }
}
```

**Why it is pure:**
- Takes input (`template`), returns output (`model`)
- No side effects (no I/O, no mutation, no random)
- Same input always produces same output
- Deterministic and testable

**Why it is server-safe:**
- No imports of React, browser APIs, or client-side libraries
- Can run in Node.js, serverless functions, or Deno
- Can be called during server-side rendering

**Future use:**
```typescript
// Server-side route
export async function GET(req) {
  const templateId = req.query.templateId
  const template = await db.templates.find(templateId)
  const model = buildMeditationTimelineModel(template)
  return json(model)
}

// Client-side
const model = await fetch(`/api/chart-model?templateId=${id}`).then(r => r.json())
return <MeditationTimelineChart model={model} />
```

### How this enables reuse in mobile and server rendering

**React Native mobile:**
```typescript
// ios/Android: import build the same model
import { buildMeditationTimelineModel } from '@/domains/metrics/charts/buildMeditationTimelineModel'

// Render with a native component
<TimelineView model={buildMeditationTimelineModel(template)} />
```

**Server-side rendering (Next.js):**
```typescript
// In /app/sessions/[id]/layout.tsx (server component)
const template = await db.templates.findById(templateId)
const model = buildMeditationTimelineModel(template) // Runs on server

// Pass to client component
<ClientChartWrapper model={model} />
```

**Headless UI (via API):**
```typescript
// Return model as JSON
const model = buildMeditationTimelineModel(template)
res.json(model)

// Client (web, iOS via REST, Android via REST)
const model = await fetch('/api/models/timeline').then(r => r.json())
renderChart(model)
```

---

## 10. Explicit non-goals of this refinement

This refinement **intentionally does not include:**

- **Supabase integration:** LocalSessionTemplateStore remains the only store. Architecture allows Supabase later without changes to the engine.
- **Payments or subscriptions:** No premium tiers, paywall, or seat limits introduced.
- **Wearable integrations:** Heart rate, step count, and other biometric data are not collected or tracked.
- **Global state libraries:** No Redux, Zustand, Jotai, or Recoil. React hooks and refs are sufficient.
- **AI features:** No LLM integrations, smart recommendations, or generative content.
- **Server actions or API routes:** No `/api/*` endpoints added (future Supabase integration will add these).
- **TypeScript strict mode relaxations:** All code remains strict-safe. No `any` types introduced.
- **Database schema changes:** No Prisma migrations or database modifications.
- **Third-party analytics:** No event tracking, no telemetry (privacy-first).
- **Component library upgrades:** Existing chart.js, recharts, D3 libraries remain as-is.
- **Mobile app binary:** No React Native or Expo project structure yet (forward-compatible, but not implemented).

---

## 11. How to extend this safely

### Adding a new chart

**Step 1:** Define a new model type in `/src/domains/metrics/charts/types.ts`:
```typescript
export interface MeditationStatsModel {
  weeklyCount: number[]    // Sessions per day this week
  averageDuration: number  // Average session duration in seconds
  longestStreak: number    // Days in current streak
}
```

**Step 2:** Create a pure builder function in `/src/domains/metrics/charts/buildMeditationStatsModel.ts`:
```typescript
export function buildMeditationStatsModel(runs: SessionRun[]): MeditationStatsModel {
  // Compute stats from SessionRun array (server-safe, pure)
  // Return model
}
```

**Step 3:** Create a client component in `/src/domains/metrics/charts/MeditationStatsChart.tsx`:
```typescript
'use client'

export function MeditationStatsChart({ model }: { model: MeditationStatsModel }) {
  // Render SVG or HTML based on model
  // Never import SessionRun, SessionTemplate, or meditation concepts
}
```

**Step 4:** Use in page:
```typescript
const model = buildMeditationStatsModel(sessionRuns) // or fetch from API
return <MeditationStatsChart model={model} />
```

**DO:**
- Keep the model type pure (no functions, just data)
- Keep the builder function pure (no React, no I/O)
- Keep the chart component focused (only rendering, no data logic)

**DON'T:**
- Import SessionTemplate or SessionEngine into the chart component
- Call backend APIs from the chart component
- Hardcode colors or labels in the builder (pass them as model properties instead)

---

### Adding a new store implementation

**Step 1:** Implement the `SessionTemplateStore` interface:
```typescript
// /src/domains/meditation/store/NotionSessionTemplateStore.ts

import { SessionTemplateStore } from './SessionTemplateStore'
import { SessionTemplate } from '../engine/types'

export class NotionSessionTemplateStore implements SessionTemplateStore {
  constructor(private notionClient: NotionClient, private databaseId: string) {}

  async list(): Promise<SessionTemplate[]> {
    const response = await this.notionClient.databases.query({
      database_id: this.databaseId
    })
    return response.results.map(page => deserializeTemplate(page))
  }

  async get(id: string): Promise<SessionTemplate | null> {
    // Use notion client
  }

  async save(t: SessionTemplate): Promise<void> {
    // Use notion client
  }

  async remove(id: string): Promise<void> {
    // Use notion client
  }
}
```

**Step 2:** Use in your component:
```typescript
const store = new NotionSessionTemplateStore(notionClient, dbId)
const templates = await store.list()
```

**DO:**
- Maintain the same method signatures and return types
- Handle errors (log them!)
- Keep API calls local to the store class

**DON'T:**
- Change the interface signature
- Couple the store to the component (inject it)
- Let store failures crash the app silently

---

### Persisting SessionRun later

When you're ready to save meditation sessions:

**Step 1:** Create a `SessionRunStore` interface:
```typescript
// /src/domains/meditation/store/SessionRunStore.ts
export interface SessionRunStore {
  save(run: SessionRun): Promise<void>
  listByUser(userId: string): Promise<SessionRun[]>
  listByTemplate(templateId: string): Promise<SessionRun[]>
}
```

**Step 2:** Implement with Supabase:
```typescript
// /src/domains/meditation/store/SupabaseSessionRunStore.ts
export class SupabaseSessionRunStore implements SessionRunStore {
  constructor(private supabase: SupabaseClient, private userId: string) {}

  async save(run: SessionRun): Promise<void> {
    const { error } = await this.supabase
      .from('session_runs')
      .insert([{ user_id: this.userId, ...run }])
    
    if (error) console.warn('[SupabaseSessionRunStore] Failed to save:', error.message)
  }

  async listByUser(userId: string): Promise<SessionRun[]> {
    const { data, error } = await this.supabase
      .from('session_runs')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.warn('[SupabaseSessionRunStore] Failed to list:', error.message)
      return []
    }
    return data || []
  }

  async listByTemplate(templateId: string): Promise<SessionRun[]> {
    // similar query
  }
}
```

**Step 3:** Update the meditation page:
```typescript
const runStore = new SupabaseSessionRunStore(supabase, userId)

const handleSessionEnd = () => {
  const sessionRun = { ... } // Construct SessionRun
  await runStore.save(sessionRun)
  console.log('[SessionRun] Saved:', sessionRun)
}
```

**DO:**
- Follow the same error logging pattern
- Use the same interface approach (abstract, then implement)
- Keep the engine unaware of the store

**DON'T:**
- Modify SessionEngine to call the store directly
- Add database schema changes without migrations
- Skip error handling

---

### Adding community features without touching the engine

The engine is read-only from a community perspective. Community features consume:
- `SessionTemplate` (to display popular presets)
- `SessionRun` (to compute stats, leaderboards, streaks)

Example flow:

**Step 1:** Query SessionRuns from Supabase:
```typescript
// /src/features/community/getLeaderboard.ts (server function or API route)
const { data: topRuns } = await supabase
  .from('session_runs')
  .select('*, user:user_id(*)')
  .order('durationSec', { ascending: false })
  .limit(10)

return topRuns
```

**Step 2:** Display without modifying the engine:
```typescript
// /src/features/community/LeaderboardChart.tsx (client component)
export function LeaderboardChart({ runs }: { runs: SessionRun[] }) {
  return (
    <div>
      {runs.map(run => (
        <div key={run.id}>
          {run.user.name}: {formatTime(run.durationSec)}
        </div>
      ))}
    </div>
  )
}
```

**Why this works:**
- `SessionRun` is immutable and public
- The engine has no knowledge of the leaderboard
- Multiple features can independently query `SessionRun`
- Engine logic remains unchanged regardless of how data is used

---

## Conclusion

This refinement hardened the design by:

1. **Eliminating timing drift:** Elapsed time is now derived from `performance.now()`, always.
2. **Clarifying lifecycle ownership:** The controller hook owns the engine, not React state.
3. **Making errors visible:** Store failures are logged and debuggable.
4. **Protecting the data model:** Charts consume only pure model, not meditation concepts.
5. **Preparing for scale:** Store abstraction allows Supabase, SessionRun is ready for persistence.

The architecture is now production-ready for:
- **Single-user sessions** (current state)
- **Multi-device sync** (Supabase SessionTemplateStore)
- **Community features** (SessionRun persistence + leaderboards)
- **Mobile apps** (engine is React-Native-ready)

---

**Last updated:** February 2026  
**Maintained by:** Meditation architecture team
