export interface BellSound {
  id: string
  url: string
}

export interface AmbientSound {
  id: string
  url: string
}

export interface SessionTemplate {
  id: string
  name: string
  durationSec: number
  startBell?: BellSound
  endBell?: BellSound
  intervalBell?: {
    everySec: number
    sound: BellSound
  }
  ambient?: {
    sound: AmbientSound
    volume: number
  }
  createdAt: number
}
