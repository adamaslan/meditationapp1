export interface AudioAdapter {
  preload(url: string): Promise<void>
  playOnce(url: string, volume?: number): Promise<void>
  playLoop(url: string, volume?: number): Promise<void>
  stop(url: string): Promise<void>
  stopAll(): Promise<void>
}
