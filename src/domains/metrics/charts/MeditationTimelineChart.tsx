'use client'

import React from 'react'
import { MeditationTimelineModel } from './types'

interface MeditationTimelineChartProps {
  model: MeditationTimelineModel
}

export function MeditationTimelineChart({
  model
}: MeditationTimelineChartProps): React.ReactElement {
  const width = 800
  const height = 120
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Simple linear scale for seconds to pixels
  const scale = (sec: number): number => {
    return (sec / model.durationSec) * chartWidth
  }

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <svg width={width} height={height} style={{ border: '1px solid #ddd' }}>
      {/* Background */}
      <rect
        x={padding.left}
        y={padding.top}
        width={chartWidth}
        height={chartHeight}
        fill="#f9f9f9"
      />

      {/* Timeline axis line */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight / 2}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight / 2}
        stroke="#999"
        strokeWidth={2}
      />

      {/* Tick marks and labels */}
      {model.ticks.map((tick, idx) => {
        const x = padding.left + scale(tick)
        return (
          <g key={`tick-${idx}`}>
            {/* Tick line */}
            <line
              x1={x}
              y1={padding.top + chartHeight / 2 - 5}
              x2={x}
              y2={padding.top + chartHeight / 2 + 5}
              stroke="#999"
              strokeWidth={1}
            />
            {/* Tick label */}
            <text
              x={x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              fontSize={12}
              fill="#666"
            >
              {formatTime(tick)}
            </text>
          </g>
        )
      })}

      {/* Interval bell markers */}
      {model.intervalMarkers.map((markerSec, idx) => {
        const x = padding.left + scale(markerSec)
        return (
          <g key={`interval-${idx}`}>
            {/* Vertical marker line */}
            <line
              x1={x}
              y1={padding.top}
              x2={x}
              y2={padding.top + chartHeight}
              stroke="#4CAF50"
              strokeWidth={2}
              opacity={0.6}
            />
            {/* Dot at the axis */}
            <circle
              cx={x}
              cy={padding.top + chartHeight / 2}
              r={4}
              fill="#4CAF50"
            />
          </g>
        )
      })}

      {/* End marker */}
      {model.endMarker <= model.durationSec && (
        <g>
          <line
            x1={padding.left + scale(model.endMarker)}
            y1={padding.top}
            x2={padding.left + scale(model.endMarker)}
            y2={padding.top + chartHeight}
            stroke="#FF6B6B"
            strokeWidth={3}
            opacity={0.7}
          />
          <circle
            cx={padding.left + scale(model.endMarker)}
            cy={padding.top + chartHeight / 2}
            r={5}
            fill="#FF6B6B"
          />
        </g>
      )}

      {/* Legend */}
      <g>
        <rect x={padding.left} y={height - 25} width={12} height={12} fill="#4CAF50" />
        <text x={padding.left + 16} y={height - 14} fontSize={12} fill="#666">
          Interval Bell
        </text>

        <line
          x1={padding.left + 120}
          y1={height - 19}
          x2={padding.left + 132}
          y2={height - 19}
          stroke="#FF6B6B"
          strokeWidth={3}
        />
        <text x={padding.left + 136} y={height - 14} fontSize={12} fill="#666">
          Session End
        </text>
      </g>
    </svg>
  )
}
