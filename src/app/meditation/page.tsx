'use client'

import React, { useState, useEffect } from 'react'
import { SessionTemplate } from '@/domains/meditation/engine/types'
import { SessionRun } from '@/domains/meditation/engine/SessionRun'
import { WebAudioAdapter } from '@/domains/meditation/audio/WebAudioAdapter'
import { LocalSessionTemplateStore } from '@/domains/meditation/store/LocalSessionTemplateStore'
import { useMeditationSessionController } from '@/domains/meditation/ui/useMeditationSessionController'
import { buildMeditationTimelineModel } from '@/domains/metrics/charts/buildMeditationTimelineModel'
import { MeditationTimelineChart } from '@/domains/metrics/charts/MeditationTimelineChart'

const EXAMPLE_TEMPLATE: SessionTemplate = {
  id: 'default-5min',
  name: '5 Minute Meditation',
  durationSec: 300,
  startBell: {
    id: 'bell-start',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
  },
  endBell: {
    id: 'bell-end',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
  },
  intervalBell: {
    everySec: 60,
    sound: {
      id: 'bell-interval',
      url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
    }
  },
  createdAt: Date.now()
}

export default function MeditationPage(): React.ReactElement {
  const [templates, setTemplates] = useState<SessionTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [store] = useState(() => new LocalSessionTemplateStore())
  const [audio] = useState(() => new WebAudioAdapter())
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  // Initialize templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      const stored = await store.list()
      if (stored.length === 0) {
        // Seed with example template
        await store.save(EXAMPLE_TEMPLATE)
        setTemplates([EXAMPLE_TEMPLATE])
        setSelectedTemplateId(EXAMPLE_TEMPLATE.id)
      } else {
        setTemplates(stored)
        if (stored.length > 0) {
          setSelectedTemplateId(stored[0].id)
        }
      }
    }
    loadTemplates()
  }, [store])

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  // Use the controller hook
  const controller = useMeditationSessionController(selectedTemplate || null, audio)

  const handleStart = async () => {
    if (!selectedTemplate) {
      return
    }
    setSessionStartTime(Date.now())
    await controller.start()
  }

  const handleSessionEnd = () => {
    if (!selectedTemplate || sessionStartTime === null) {
      return
    }

    // Construct SessionRun object in memory and log it
    const sessionRun: SessionRun = {
      id: `run-${Date.now()}`,
      templateId: selectedTemplate.id,
      startedAt: sessionStartTime,
      endedAt: Date.now(),
      durationSec: controller.elapsedSec
    }

    console.log('[SessionRun] Completed:', sessionRun)
    setSessionStartTime(null)
  }

  const handleStop = async () => {
    await controller.stop()
    handleSessionEnd()
  }

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const chartModel = selectedTemplate
    ? buildMeditationTimelineModel(selectedTemplate)
    : null

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🧘 Meditation Session</h1>

      {/* Template selector */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="template-select">
          <strong>Choose Template:</strong>
        </label>
        <select
          id="template-select"
          value={selectedTemplateId || ''}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          disabled={controller.isRunning}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({Math.floor(t.durationSec / 60)}min)
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {chartModel && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Session Timeline</h3>
          <MeditationTimelineChart model={chartModel} />
        </div>
      )}

      {/* Timer display */}
      <div
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '20px',
          marginTop: '20px',
          color: '#333'
        }}
      >
        {formatTime(controller.elapsedSec)} /{' '}
        {selectedTemplate
          ? formatTime(selectedTemplate.durationSec)
          : '0:00'}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleStart}
          disabled={controller.isRunning || !selectedTemplate}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: controller.isRunning || !selectedTemplate ? 'not-allowed' : 'pointer',
            backgroundColor: controller.isRunning || !selectedTemplate ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Start
        </button>

        <button
          onClick={() => controller.pause()}
          disabled={!controller.isRunning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: !controller.isRunning ? 'not-allowed' : 'pointer',
            backgroundColor: !controller.isRunning ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Pause
        </button>

        <button
          onClick={() => controller.resume()}
          disabled={controller.isRunning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: controller.isRunning ? 'not-allowed' : 'pointer',
            backgroundColor: controller.isRunning ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Resume
        </button>

        <button
          onClick={handleStop}
          disabled={!controller.isRunning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: !controller.isRunning ? 'not-allowed' : 'pointer',
            backgroundColor: !controller.isRunning ? '#ccc' : '#FF6B6B',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Stop
        </button>
      </div>

      {/* Status */}
      <div style={{ color: '#666', fontSize: '14px' }}>
        Status:{' '}
        <strong>
          {!controller.isRunning ? 'Idle' : 'Running'}
        </strong>
        (Open console to see events and session runs)
      </div>
    </div>
  )
}
