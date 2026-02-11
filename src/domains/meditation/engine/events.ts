export type SessionEvent =
  | { type: 'started'; startedAt: number }
  | { type: 'paused'; elapsedSec: number }
  | { type: 'resumed'; elapsedSec: number }
  | { type: 'interval'; index: number; elapsedSec: number }
  | { type: 'ended'; totalElapsedSec: number }
  | { type: 'tick'; elapsedSec: number }
