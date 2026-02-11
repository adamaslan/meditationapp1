'use client'

import { useRef, useState, useEffect } from 'react'
import { SessionTemplate } from '../engine/types'
import { SessionEvent } from '../engine/events'
import { SessionEngine } from '../engine/SessionEngine'
import { AudioAdapter } from '../audio/AudioAdapter'

interface ControllerState {
  elapsedSec: number
  isRunning: boolean
}

export function useMeditationSessionController(
  template: SessionTemplate | null,
  audio: AudioAdapter
) {
  const engineRef = useRef<SessionEngine | null>(null)
  const [state, setState] = useState<ControllerState>({
    elapsedSec: 0,
    isRunning: false
  })
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Dispose and recreate engine when template changes
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop().catch(() => {})
        engineRef.current = null
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }
  }, [template])

  const start = async (): Promise<void> => {
    if (!template || engineRef.current) {
      return
    }

    const engine = new SessionEngine(template, audio)
    engineRef.current = engine

    // Subscribe to engine events
    const unsubscribe = engine.onEvent((event: SessionEvent) => {
      if (event.type === 'started') {
        setState({ elapsedSec: 0, isRunning: true })
        startUIRefresh()
      } else if (event.type === 'paused') {
        setState((prev) => ({ ...prev, isRunning: false }))
        stopUIRefresh()
      } else if (event.type === 'resumed') {
        setState((prev) => ({ ...prev, isRunning: true }))
        startUIRefresh()
      } else if (event.type === 'ended') {
        setState({ elapsedSec: event.totalElapsedSec, isRunning: false })
        stopUIRefresh()
        engineRef.current = null
        unsubscribe()
      }
    })

    await engine.start()
  }

  const pause = (): void => {
    if (engineRef.current) {
      engineRef.current.pause()
    }
  }

  const resume = (): void => {
    if (engineRef.current) {
      engineRef.current.resume()
    }
  }

  const stop = async (): Promise<void> => {
    if (engineRef.current) {
      await engineRef.current.stop()
      stopUIRefresh()
      setState({ elapsedSec: 0, isRunning: false })
      engineRef.current = null
    }
  }

  const startUIRefresh = () => {
    if (updateIntervalRef.current) {
      return
    }
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

  const stopUIRefresh = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }

  return {
    start,
    pause,
    resume,
    stop,
    elapsedSec: state.elapsedSec,
    isRunning: state.isRunning
  }
}
