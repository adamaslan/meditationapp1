import { SessionTemplate } from './types'
import { SessionEvent } from './events'
import { AudioAdapter } from '../audio/AudioAdapter'

export class SessionEngine {
  private template: SessionTemplate
  private audio: AudioAdapter

  private state: 'idle' | 'running' | 'paused' = 'idle'
  private startTime: number = 0
  private totalPausedMs: number = 0
  private pauseTime: number = 0
  private tickIntervalId: NodeJS.Timeout | null = null
  private bellCheckIntervalId: NodeJS.Timeout | null = null
  private lastFiredIntervalBellIndex: number = -1
  private endBellFired: boolean = false
  private eventHandlers: Array<(e: SessionEvent) => void> = []

  constructor(template: SessionTemplate, audio: AudioAdapter) {
    this.template = template
    this.audio = audio
  }

  async start(): Promise<void> {
    if (this.state !== 'idle') {
      return
    }

    this.state = 'running'
    this.startTime = performance.now()
    this.totalPausedMs = 0
    this.lastFiredIntervalBellIndex = -1
    this.endBellFired = false

    // Emit started event
    this.emit({
      type: 'started',
      startedAt: Date.now()
    })

    // Play start bell
    if (this.template.startBell) {
      await this.audio.playOnce(this.template.startBell.url)
    }

    // Start ambient audio
    if (this.template.ambient) {
      await this.audio.playLoop(
        this.template.ambient.sound.url,
        this.template.ambient.volume
      )
    }

    // Tick emission (approximately once per second)
    this.tickIntervalId = setInterval(() => {
      if (this.state === 'running') {
        const elapsed = this.getElapsedTime()
        this.emit({
          type: 'tick',
          elapsedSec: elapsed
        })
      }
    }, 1000)

    // Bell check interval (every 100ms for precision)
    this.bellCheckIntervalId = setInterval(() => {
      if (this.state === 'running') {
        this.checkAndFireBells()
      }
    }, 100)
  }

  pause(): void {
    if (this.state !== 'running') {
      return
    }

    this.state = 'paused'
    this.pauseTime = performance.now()

    this.emit({
      type: 'paused',
      elapsedSec: this.getElapsedSec()
    })

    // Stop ambient audio
    if (this.template.ambient) {
      this.audio.stop(this.template.ambient.sound.url).catch(() => {})
    }
  }

  resume(): void {
    if (this.state !== 'paused') {
      return
    }

    this.state = 'running'
    const pauseDurationMs = performance.now() - this.pauseTime
    this.totalPausedMs += pauseDurationMs

    this.emit({
      type: 'resumed',
      elapsedSec: this.getElapsedSec()
    })

    // Restart ambient audio
    if (this.template.ambient) {
      this.audio.playLoop(
        this.template.ambient.sound.url,
        this.template.ambient.volume
      ).catch(() => {})
    }
  }

  async stop(): Promise<void> {
    if (this.state === 'idle') {
      return
    }

    const elapsedSec = this.getElapsedSec()

    this.state = 'idle'

    // Clear intervals
    if (this.tickIntervalId !== null) {
      clearInterval(this.tickIntervalId)
      this.tickIntervalId = null
    }
    if (this.bellCheckIntervalId !== null) {
      clearInterval(this.bellCheckIntervalId)
      this.bellCheckIntervalId = null
    }

    // Stop all audio
    await this.audio.stopAll()

    // Emit ended event
    this.emit({
      type: 'ended',
      totalElapsedSec: elapsedSec
    })
  }

  onEvent(handler: (e: SessionEvent) => void): () => void {
    this.eventHandlers.push(handler)
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler)
    }
  }

  getElapsedSec(): number {
    if (this.state === 'idle') {
      return 0
    }
    if (this.state === 'paused') {
      const elapsedMs = this.pauseTime - this.startTime - this.totalPausedMs
      return elapsedMs / 1000
    }
    // Running
    const now = performance.now()
    const elapsedMs = now - this.startTime - this.totalPausedMs
    return elapsedMs / 1000
  }

  private getElapsedTime(): number {
    return this.getElapsedSec()
  }

  private checkAndFireBells(): void {
    const elapsedSec = this.getElapsedTime()

    // Fire end bell
    if (elapsedSec >= this.template.durationSec && !this.endBellFired) {
      this.endBellFired = true
      if (this.template.endBell) {
        this.audio.playOnce(this.template.endBell.url).catch(() => {})
      }
      this.emit({
        type: 'interval',
        index: -1,
        elapsedSec
      })
      return
    }

    // Fire interval bells
    if (this.template.intervalBell) {
      const intervalSec = this.template.intervalBell.everySec
      const currentIntervalIndex = Math.floor(elapsedSec / intervalSec)

      if (
        currentIntervalIndex > this.lastFiredIntervalBellIndex &&
        elapsedSec < this.template.durationSec
      ) {
        this.lastFiredIntervalBellIndex = currentIntervalIndex
        this.audio.playOnce(this.template.intervalBell.sound.url).catch(() => {})
        this.emit({
          type: 'interval',
          index: currentIntervalIndex,
          elapsedSec
        })
      }
    }
  }

  private emit(event: SessionEvent): void {
    for (const handler of this.eventHandlers) {
      handler(event)
    }
  }
}
