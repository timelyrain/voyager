'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CountrySelector from '@/components/CountrySelector'
import StatsPanel from '@/components/StatsPanel'
import type { User } from '@supabase/supabase-js'

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false })

type Panel = 'map' | 'list' | 'stats'

export default function MapPage() {
  const [user, setUser] = useState<User | null>(null)
  const [visitedCodes, setVisitedCodes] = useState<Set<string>>(new Set())
  const [panel, setPanel] = useState<Panel>('map')
  const [saving, setSaving] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data } = await supabase
        .from('visited_countries')
        .select('country_code')
        .eq('user_id', user.id)

      if (data && data.length === 0) {
        setIsFirstVisit(true)
        setPanel('list')
      } else if (data) {
        setVisitedCodes(new Set(data.map((r: { country_code: string }) => r.country_code)))
      }
      setLoaded(true)
    }
    load()
  }, [])

  const toggleCountry = useCallback((code: string) => {
    setVisitedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }, [])

  async function saveAndShowMap() {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    const codes = Array.from(visitedCodes)

    const { data: existing } = await supabase
      .from('visited_countries')
      .select('country_code')
      .eq('user_id', user.id)

    const existingCodes = new Set((existing || []).map((r: { country_code: string }) => r.country_code))
    const toAdd = codes.filter((c) => !existingCodes.has(c))
    const toRemove = Array.from(existingCodes).filter((c) => !visitedCodes.has(c))

    if (toAdd.length > 0) {
      await supabase.from('visited_countries').insert(
        toAdd.map((country_code) => ({ user_id: user.id, country_code }))
      )
    }
    if (toRemove.length > 0) {
      await supabase
        .from('visited_countries')
        .delete()
        .eq('user_id', user.id)
        .in('country_code', toRemove)
    }

    setSaving(false)
    setIsFirstVisit(false)
    setPanel('map')
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const visitedArray = Array.from(visitedCodes)

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-lg tracking-tight">Voyager</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-400 truncate max-w-[180px]">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-800">
            <TabButton active={panel === 'stats'} onClick={() => setPanel('stats')}>Stats</TabButton>
            <TabButton active={panel === 'list'} onClick={() => setPanel('list')}>Countries</TabButton>
          </div>
          <div className="flex-1 overflow-hidden">
            {panel === 'stats' && (
              <div className="p-4 overflow-y-auto h-full">
                <StatsPanel visitedCodes={visitedArray} />
              </div>
            )}
            {panel === 'list' && (
              <CountrySelector
                visitedCodes={visitedCodes}
                onToggleCountry={toggleCountry}
                onDone={saveAndShowMap}
                saving={saving}
              />
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 p-3">
          <WorldMap visitedCodes={visitedCodes} onToggleCountry={toggleCountry} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {panel === 'map' && (
            <div className="absolute inset-0 p-2">
              <WorldMap visitedCodes={visitedCodes} onToggleCountry={toggleCountry} />
            </div>
          )}
          {panel === 'list' && (
            <div className="absolute inset-0 overflow-hidden flex flex-col">
              <CountrySelector
                visitedCodes={visitedCodes}
                onToggleCountry={toggleCountry}
                onDone={saveAndShowMap}
                saving={saving}
              />
            </div>
          )}
          {panel === 'stats' && (
            <div className="absolute inset-0 overflow-y-auto p-4">
              <StatsPanel visitedCodes={visitedArray} />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <nav className="shrink-0 flex border-t border-gray-800 bg-gray-900">
          <MobileNavButton active={panel === 'map'} onClick={() => setPanel('map')} icon="🗺️" label="Map" />
          <MobileNavButton active={panel === 'list'} onClick={() => setPanel('list')} icon="✈️" label="Countries" />
          <MobileNavButton active={panel === 'stats'} onClick={() => setPanel('stats')} icon="📊" label="Stats" />
        </nav>
      </div>

      {/* First-visit overlay hint */}
      {isFirstVisit && panel === 'list' && (
        <div className="absolute bottom-20 md:hidden left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          Tap countries you have visited, then press Done
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors ${
        active ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function MobileNavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
        active ? 'text-emerald-400' : 'text-gray-500'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
