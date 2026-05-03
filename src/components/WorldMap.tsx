'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { useState } from 'react'
import { COUNTRIES } from '@/data/countries'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  visitedCodes: Set<string>
  onToggleCountry: (code: string) => void
}

export default function WorldMap({ visitedCodes, onToggleCountry }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null)
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 })

  const numericToCode = new Map(COUNTRIES.map((c) => [c.numeric, c.code]))

  function getCountryCode(geoId: string): string | undefined {
    const padded = geoId.padStart(3, '0')
    return numericToCode.get(padded)
  }

  return (
    <div className="relative w-full h-full bg-[#0f172a] rounded-xl overflow-hidden">
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
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      const country = COUNTRIES.find((c) => c.code === code)
                      if (country) {
                        setTooltip({ name: country.name, x: e.clientX, y: e.clientY })
                      }
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (code) onToggleCountry(code)
                    }}
                    style={{
                      default: {
                        fill: isVisited ? '#10b981' : '#1e3a5f',
                        stroke: '#0f172a',
                        strokeWidth: 0.3,
                        outline: 'none',
                        cursor: code ? 'pointer' : 'default',
                        transition: 'fill 0.15s ease',
                      },
                      hover: {
                        fill: isVisited ? '#34d399' : '#2d5a8e',
                        stroke: '#0f172a',
                        strokeWidth: 0.3,
                        outline: 'none',
                        cursor: code ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: isVisited ? '#059669' : '#10b981',
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

      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded-md pointer-events-none shadow-lg border border-gray-700"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          {tooltip.name}
        </div>
      )}

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
