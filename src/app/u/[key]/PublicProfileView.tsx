'use client'

import dynamic from 'next/dynamic'
import StatsPanel from '@/components/StatsPanel'
import { useState } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { type ThemeId } from '@/lib/themes'

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false })

interface PublicProfileViewProps {
  displayName: string | null
  theme: string | null
  visitedCodes: string[]
  bucketCodes: string[]
  citiesVisited: string[]
}

export default function PublicProfileView({ displayName, theme, visitedCodes, bucketCodes, citiesVisited }: PublicProfileViewProps) {
  const visited = new Set(visitedCodes)
  const bucket = new Set(bucketCodes)
  const [panel, setPanel] = useState<'map' | 'stats'>('map')
  const name = displayName || 'A traveller'

  return (
    <ThemeProvider initialTheme={(theme || undefined) as ThemeId | undefined}>
    <div className="flex flex-col h-[100dvh] bg-[#0f172a] text-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-lg tracking-tight">{name}'s Travel Map</span>
        </div>
        <a href="/" className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors shadow-sm">
          Create your own
        </a>
      </header>

      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0 border-r border-gray-800 overflow-y-auto p-4">
          <StatsPanel visitedCodes={visitedCodes} bucketCodes={bucketCodes} bucketCount={bucketCodes.length} citiesVisited={citiesVisited} />
        </div>
        <div className="flex-1 p-3">
          <WorldMap visitedCodes={visited} bucketCodes={bucket} readonly />
        </div>
      </div>

      <div className="md:hidden flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {panel === 'map' && (
            <div className="absolute inset-0 p-2">
              <WorldMap visitedCodes={visited} bucketCodes={bucket} readonly />
            </div>
          )}
          {panel === 'stats' && (
            <div className="absolute inset-0 overflow-y-auto p-4">
              <StatsPanel visitedCodes={visitedCodes} bucketCodes={bucketCodes} bucketCount={bucketCodes.length} citiesVisited={citiesVisited} />
            </div>
          )}
        </div>
        <nav className="shrink-0 flex border-t border-gray-800 bg-gray-900">
          {(['map', 'stats'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                panel === p ? 'theme-text' : 'text-gray-500'
              }`}
            >
              {p === 'map' ? '🗺️ Map' : '📊 My Log'}
            </button>
          ))}
        </nav>
      </div>
    </div>
    </ThemeProvider>
  )
}
