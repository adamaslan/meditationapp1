import { SessionTemplate } from '../../meditation/engine/types'
import { MeditationTimelineModel } from './types'

export function buildMeditationTimelineModel(
  template: SessionTemplate
): MeditationTimelineModel {
  const durationSec = template.durationSec
  const intervalMarkers: number[] = []

  // Collect interval bell positions
  if (template.intervalBell) {
    const intervalSec = template.intervalBell.everySec
    let markerPosition = intervalSec

    while (markerPosition < durationSec) {
      intervalMarkers.push(markerPosition)
      markerPosition += intervalSec
    }
  }

  // Generate reasonable tick positions
  const ticks = generateTicks(durationSec)

  return {
    durationSec,
    intervalMarkers,
    endMarker: durationSec,
    ticks
  }
}

function generateTicks(durationSec: number): number[] {
  // Generate evenly-spaced tick marks for the timeline axis
  const ticks: number[] = [0]

  if (durationSec <= 60) {
    // For sessions <= 1 minute, tick every 15 seconds
    const step = 15
    for (let i = step; i <= durationSec; i += step) {
      ticks.push(i)
    }
  } else if (durationSec <= 600) {
    // For sessions <= 10 minutes, tick every 60 seconds
    const step = 60
    for (let i = step; i <= durationSec; i += step) {
      ticks.push(i)
    }
  } else if (durationSec <= 3600) {
    // For sessions <= 1 hour, tick every 5 minutes
    const step = 300
    for (let i = step; i <= durationSec; i += step) {
      ticks.push(i)
    }
  } else {
    // For longer sessions, tick every 10 minutes
    const step = 600
    for (let i = step; i <= durationSec; i += step) {
      ticks.push(i)
    }
  }

  // Ensure end is included
  if (ticks[ticks.length - 1] !== durationSec) {
    ticks.push(durationSec)
  }

  return ticks
}
