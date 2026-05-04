'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { useState, useRef } from 'react'
import { COUNTRIES } from '@/data/countries'
import { useTheme } from '@/context/ThemeContext'
import { THEMES } from '@/lib/themes'
import { BOURDAIN_COUNTRIES } from '@/data/bourdainCountries'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  visitedCodes: Set<string>
  bucketCodes: Set<string>
  onToggleCountry?: (code: string) => void
  onOpenJournal?: (code: string) => void
  readonly?: boolean
}

export default function WorldMap({ visitedCodes, bucketCodes, onToggleCountry, onOpenJournal, readonly = false }: WorldMapProps) {
  const { theme } = useTheme()
  const tc = THEMES[theme]
  const [tooltip, setTooltip] = useState<{ name: string; code: string; x: number; y: number } | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 })

  function getFlagEmoji(code: string) {
    return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('')
  }

  function scheduleHide() {
    hideTimerRef.current = setTimeout(() => setTooltip(null), 180)
  }
  function cancelHide() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  function getCountryFill(isVisited: boolean, inBucket: boolean, hover = false) {
    if (isVisited) return hover ? tc.visitedHover : tc.visitedColor
    if (inBucket) return hover ? tc.bucketHover : tc.bucketColor
    return hover ? '#2d5a8e' : '#1e3a5f'
  }

  const numericToCode = new Map(COUNTRIES.map((c) => [c.numeric, c.code]))

  function getCountryCode(geoId: string): string | undefined {
    const padded = geoId.padStart(3, '0')
    return numericToCode.get(padded)
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={({ zoom, coordinates }) => setPosition({ zoom, coordinates })}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = getCountryCode(String(geo.id))
                const isVisited = code ? visitedCodes.has(code) : false
                const inBucket = code ? bucketCodes.has(code) : false
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      cancelHide()
                      const country = COUNTRIES.find((c) => c.code === code)
                      if (country) {
                        setTooltip({ name: country.name, code: country.code, x: e.clientX, y: e.clientY })
                      }
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => scheduleHide()}
                    onClick={() => {
                      if (code && !readonly && onToggleCountry) onToggleCountry(code)
                    }}
                    style={{
                      default: {
                        fill: getCountryFill(isVisited, inBucket),
                        stroke: '#0f172a',
                        strokeWidth: 0.3,
                        outline: 'none',
                        cursor: code && !readonly ? 'pointer' : 'default',
                        transition: 'fill 0.15s ease',
                      },
                      hover: {
                        fill: getCountryFill(isVisited, inBucket, true),
                        stroke: '#0f172a',
                        strokeWidth: 0.3,
                        outline: 'none',
                        cursor: code && !readonly ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: isVisited ? tc.visitedPressed : inBucket ? tc.bucketColor : tc.visitedColor,
                        outline: 'none',
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (() => {
        const bourdain = BOURDAIN_COUNTRIES[tooltip.code]
        const isVisited = visitedCodes.has(tooltip.code)
        const pencilBtn = onOpenJournal && isVisited && (
          <button
            onClick={() => { onOpenJournal(tooltip.code); setTooltip(null) }}
            className="ml-2 p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors shrink-0"
            title="Add journal"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </button>
        )
        return bourdain ? (
          <div
            className="fixed z-50 shadow-xl border border-gray-700 bg-gray-900 rounded-lg text-white"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10, maxWidth: 260 }}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <div className="px-3 pt-2.5 pb-1 border-b border-gray-700/60 flex items-center">
              <span className="font-semibold text-sm flex-1">{getFlagEmoji(tooltip.code)} {tooltip.name}</span>
              {pencilBtn}
            </div>
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-[11px] text-amber-400 leading-snug">🍽 {bourdain.food}</p>
              <p className="text-[11px] text-gray-400 italic leading-snug">"{bourdain.quote}"</p>
            </div>
          </div>
        ) : (
          <div
            className="fixed z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg border border-gray-700 flex items-center"
            style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            {getFlagEmoji(tooltip.code)} {tooltip.name}
            {pencilBtn}
          </div>
        )
      })()}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-gray-900/80 rounded-lg px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tc.visitedColor }} />
          <span className="text-gray-300">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tc.bucketColor }} />
          <span className="text-gray-300">Bucket list</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))}
          className="w-8 h-8 bg-gray-800 text-white rounded-md text-lg flex items-center justify-center hover:bg-gray-700 shadow-md"
        >
          +
        </button>
        <button
          onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
          className="w-8 h-8 bg-gray-800 text-white rounded-md text-lg flex items-center justify-center hover:bg-gray-700 shadow-md"
        >
          −
        </button>
        <button
          onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
          className="w-8 h-8 bg-gray-800 text-white rounded-md text-xs flex items-center justify-center hover:bg-gray-700 shadow-md"
          title="Reset view"
        >
          ⊙
        </button>
      </div>
    </div>
  )
}
