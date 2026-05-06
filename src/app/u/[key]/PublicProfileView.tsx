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
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10.5" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.75"/>
              <path d="M12 3.5 L13.3 6.2 L10.7 6.2 Z" fill="white"/>
              <line x1="22.5" y1="12"   x2="20.8" y2="12"   stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
              <line x1="12"   y1="22.5" x2="12"   y2="20.8"  stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
              <line x1="1.5"  y1="12"   x2="3.2"  y2="12"   stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
              <line x1="19.42" y1="4.58"  x2="18.51" y2="5.49"  stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
              <line x1="19.42" y1="19.42" x2="18.51" y2="18.51" stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
              <line x1="4.58"  y1="19.42" x2="5.49"  y2="18.51" stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
              <line x1="4.58"  y1="4.58"  x2="5.49"  y2="5.49"  stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
              <line x1="17.25" y1="2.91"  x2="16.75" y2="3.77"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="21.09" y1="6.75"  x2="20.23" y2="7.25"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="21.09" y1="17.25" x2="20.23" y2="16.75" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="17.25" y1="21.09" x2="16.75" y2="20.23" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="6.75"  y1="21.09" x2="7.25"  y2="20.23" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="2.91"  y1="17.25" x2="3.77"  y2="16.75" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="2.91"  y1="6.75"  x2="3.77"  y2="7.25"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="6.75"  y1="2.91"  x2="7.25"  y2="3.77"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
              <g transform="rotate(90, 12, 12)">
                <path d="M12 4.8 L11 6.5 L13 6.5 Z" fill="#ef4444"/>
              </g>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
              <circle cx="12" cy="12" r="0.6" fill="rgba(0,0,0,0.7)"/>
            </svg>
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
