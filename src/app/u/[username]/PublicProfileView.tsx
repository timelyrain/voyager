'use client'

import dynamic from 'next/dynamic'
import StatsPanel from '@/components/StatsPanel'
import { useState } from 'react'

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false })

interface Profile {
  username: string
  display_name: string | null
}

interface PublicProfileViewProps {
  profile: Profile
  visitedCodes: string[]
  bucketCodes: string[]
}

export default function PublicProfileView({ profile, visitedCodes, bucketCodes }: PublicProfileViewProps) {
  const visited = new Set(visitedCodes)
  const bucket = new Set(bucketCodes)
  const [panel, setPanel] = useState<'map' | 'stats'>('map')

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌍</span>
          <div>
            <span className="font-bold text-lg tracking-tight">
              {profile.display_name || profile.username}
            </span>
            <span className="text-gray-400 text-sm ml-2">@{profile.username}</span>
          </div>
        </div>
        <a
          href="/"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Make your own →
        </a>
      </header>

      {/* Desktop */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0 border-r border-gray-800 overflow-y-auto p-4">
          <StatsPanel visitedCodes={visitedCodes} bucketCount={bucketCodes.length} />
        </div>
        <div className="flex-1 p-3">
          <WorldMap visitedCodes={visited} bucketCodes={bucket} readonly />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {panel === 'map' && (
            <div className="absolute inset-0 p-2">
              <WorldMap visitedCodes={visited} bucketCodes={bucket} readonly />
            </div>
          )}
          {panel === 'stats' && (
            <div className="absolute inset-0 overflow-y-auto p-4">
              <StatsPanel visitedCodes={visitedCodes} bucketCount={bucketCodes.length} />
            </div>
          )}
        </div>
        <nav className="shrink-0 flex border-t border-gray-800 bg-gray-900">
          {(['map', 'stats'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                panel === p ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              {p === 'map' ? '🗺️ Map' : '📊 Stats'}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
