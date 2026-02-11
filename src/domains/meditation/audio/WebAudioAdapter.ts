import { AudioAdapter } from './AudioAdapter'

export class WebAudioAdapter implements AudioAdapter {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private activeLoops: Set<string> = new Set()

  async preload(url: string): Promise<void> {
    if (this.audioCache.has(url)) {
      return
    }

    const audio = new Audio(url)
    audio.preload = 'auto'

    return new Promise((resolve, reject) => {
      audio.addEventListener('canplay', () => {
        this.audioCache.set(url, audio)
        resolve()
      })
      audio.addEventListener('error', () => {
        reject(new Error(`Failed to preload audio from ${url}`))
      })
    })
  }

  async playOnce(url: string, volume: number = 1): Promise<void> {
    await this.ensureAudioElement(url)
    const audio = this.audioCache.get(url)!

    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    audio.loop = false

    return new Promise((resolve) => {
      const cleanup = () => {
        audio.removeEventListener('ended', cleanup)
        resolve()
      }
      audio.addEventListener('ended', cleanup)
      audio.play().catch(() => resolve())
    })
  }

  async playLoop(url: string, volume: number = 1): Promise<void> {
    await this.ensureAudioElement(url)
    const audio = this.audioCache.get(url)!

    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    audio.loop = true

    this.activeLoops.add(url)

    try {
      await audio.play()
    } catch {
      // Play may fail in some browser contexts; ignore
    }
  }

  async stop(url: string): Promise<void> {
    const audio = this.audioCache.get(url)
    if (!audio) {
      return
    }

    audio.pause()
    audio.currentTime = 0
    this.activeLoops.delete(url)
  }

  async stopAll(): Promise<void> {
    this.activeLoops.forEach((url) => {
      const audio = this.audioCache.get(url)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    this.activeLoops.clear()
  }

  private async ensureAudioElement(url: string): Promise<void> {
    if (!this.audioCache.has(url)) {
      await this.preload(url)
    }
  }
}
