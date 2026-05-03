'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import CountrySelector from '@/components/CountrySelector'
import BucketListSelector from '@/components/BucketListSelector'
import StatsPanel from '@/components/StatsPanel'
import ShareModal from '@/components/ShareModal'
import ThemeSelector from '@/components/ThemeSelector'
import { useTheme } from '@/context/ThemeContext'
import { type ThemeId } from '@/lib/themes'
import type { User } from '@supabase/supabase-js'

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false })

type Panel = 'map' | 'list' | 'bucket' | 'stats'

export default function MapPage() {
  const { setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [shareKey, setShareKey] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(288)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  function handleDividerMouseDown(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startWidth: sidebarWidth }
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const next = Math.min(Math.max(dragRef.current.startWidth + e.clientX - dragRef.current.startX, 200), 560)
      setSidebarWidth(next)
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  const [visitedCodes, setVisitedCodes] = useState<Set<string>>(new Set())
  const [bucketCodes, setBucketCodes] = useState<Set<string>>(new Set())
  const [panel, setPanel] = useState<Panel>('map')
  const [savingVisited, setSavingVisited] = useState(false)
  const [savingBucket, setSavingBucket] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const [{ data: visited }, { data: bucket }, { data: profile }] = await Promise.all([
        supabase.from('visited_countries').select('country_code').eq('user_id', user.id),
        supabase.from('bucketlist_countries').select('country_code').eq('user_id', user.id),
        supabase.from('profiles').select('share_key, theme').eq('user_id', user.id).maybeSingle(),
      ])

      if (visited && visited.length === 0) {
        setIsFirstVisit(true)
        setPanel('list')
      } else if (visited) {
        setVisitedCodes(new Set(visited.map((r: { country_code: string }) => r.country_code)))
        setPanel('stats')
      }
      if (bucket) {
        setBucketCodes(new Set(bucket.map((r: { country_code: string }) => r.country_code)))
      }
      if (profile?.share_key) setShareKey(profile.share_key)
      if (profile?.theme) setTheme(profile.theme as ThemeId)
      setLoaded(true)
    }
    load()
  }, [])

  const toggleVisited = useCallback((code: string) => {
    setVisitedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }, [])

  const toggleBucket = useCallback((code: string) => {
    setBucketCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }, [])

  async function saveVisited() {
    if (!user) return
    setSavingVisited(true)
    const supabase = createClient()
    const codes = Array.from(visitedCodes)

    const { data: existing } = await supabase
      .from('visited_countries').select('country_code').eq('user_id', user.id)

    const existingCodes = new Set((existing || []).map((r: { country_code: string }) => r.country_code))
    const toAdd = codes.filter((c) => !existingCodes.has(c))
    const toRemove = Array.from(existingCodes).filter((c) => !visitedCodes.has(c))

    if (toAdd.length > 0) {
      await supabase.from('visited_countries').insert(
        toAdd.map((country_code) => ({ user_id: user.id, country_code }))
      )
    }
    if (toRemove.length > 0) {
      await supabase.from('visited_countries').delete()
        .eq('user_id', user.id).in('country_code', toRemove)
    }

    if (toAdd.length > 0) {
      await supabase.from('bucketlist_countries').delete()
        .eq('user_id', user.id).in('country_code', toAdd)
      setBucketCodes((prev) => {
        const next = new Set(prev)
        toAdd.forEach((c) => next.delete(c))
        return next
      })
    }

    setSavingVisited(false)
    setIsFirstVisit(false)
    setPanel('map')
  }

  async function saveBucket() {
    if (!user) return
    setSavingBucket(true)
    const supabase = createClient()
    const codes = Array.from(bucketCodes)

    const { data: existing } = await supabase
      .from('bucketlist_countries').select('country_code').eq('user_id', user.id)

    const existingCodes = new Set((existing || []).map((r: { country_code: string }) => r.country_code))
    const toAdd = codes.filter((c) => !existingCodes.has(c))
    const toRemove = Array.from(existingCodes).filter((c) => !bucketCodes.has(c))

    if (toAdd.length > 0) {
      await supabase.from('bucketlist_countries').insert(
        toAdd.map((country_code) => ({ user_id: user.id, country_code }))
      )
    }
    if (toRemove.length > 0) {
      await supabase.from('bucketlist_countries').delete()
        .eq('user_id', user.id).in('country_code', toRemove)
    }

    setSavingBucket(false)
    setPanel('map')
  }

  function getShareUrl(key: string) {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    return `${base}/u/${key}`
  }

  async function handleShareClick() {
    if (!user) return
    setShareLoading(true)
    let key = shareKey
    if (!key) {
      const supabase = createClient()
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
      const { data } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, display_name: displayName })
        .select('share_key')
        .single()
      key = data?.share_key ?? null
      if (key) setShareKey(key)
    }
    setShareLoading(false)
    if (key) setShowShareModal(true)
  }

  async function handleRegenerate() {
    if (!user) return
    const newKey = crypto.randomUUID()
    const supabase = createClient()
    await supabase.from('profiles').update({ share_key: newKey }).eq('user_id', user.id)
    setShareKey(newKey)
  }

  async function handleThemeSave(theme: ThemeId) {
    if (!user) return
    const supabase = createClient()
    await supabase.from('profiles').upsert({ user_id: user.id, theme }, { onConflict: 'user_id' })
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  const handleMapToggle = useCallback((code: string) => {
    toggleVisited(code)
  }, [toggleVisited])

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
      {showShareModal && shareKey && (
        <ShareModal
          url={getShareUrl(shareKey)}
          visitedCount={visitedCodes.size}
          onClose={() => setShowShareModal(false)}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-lg tracking-tight">My Travel Log</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector onSave={handleThemeSave} />
          <button
            onClick={handleShareClick}
            disabled={shareLoading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
          >
            {shareLoading ? '…' : '🔗 Share'}
          </button>
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
        <div style={{ width: sidebarWidth }} className="shrink-0 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-800">
            <TabButton active={panel === 'stats'} onClick={() => setPanel('stats')}>Stats</TabButton>
            <TabButton active={panel === 'list'} onClick={() => setPanel('list')}>Countries</TabButton>
            <TabButton active={panel === 'bucket'} onClick={() => setPanel('bucket')} yellow>Bucket</TabButton>
          </div>
          <div className="flex-1 overflow-hidden">
            {panel === 'stats' && (
              <div className="p-4 overflow-y-auto h-full">
                <StatsPanel visitedCodes={visitedArray} bucketCodes={Array.from(bucketCodes)} bucketCount={bucketCodes.size} />
              </div>
            )}
            {panel === 'list' && (
              <CountrySelector
                visitedCodes={visitedCodes}
                onToggleCountry={toggleVisited}
                onDone={saveVisited}
                saving={savingVisited}
              />
            )}
            {panel === 'bucket' && (
              <BucketListSelector
                visitedCodes={visitedCodes}
                bucketCodes={bucketCodes}
                onToggleCountry={toggleBucket}
                onDone={saveBucket}
                saving={savingBucket}
              />
            )}
          </div>
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="w-1 shrink-0 bg-gray-800 hover:bg-emerald-500/60 active:bg-emerald-500 cursor-col-resize transition-colors select-none"
        />

        <div className="flex-1 p-3 overflow-hidden">
          <WorldMap visitedCodes={visitedCodes} bucketCodes={bucketCodes} onToggleCountry={handleMapToggle} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {panel === 'map' && (
            <div className="absolute inset-0 p-2">
              <WorldMap visitedCodes={visitedCodes} bucketCodes={bucketCodes} onToggleCountry={handleMapToggle} />
            </div>
          )}
          {panel === 'list' && (
            <div className="absolute inset-0 overflow-hidden flex flex-col">
              <CountrySelector
                visitedCodes={visitedCodes}
                onToggleCountry={toggleVisited}
                onDone={saveVisited}
                saving={savingVisited}
              />
            </div>
          )}
          {panel === 'bucket' && (
            <div className="absolute inset-0 overflow-hidden flex flex-col">
              <BucketListSelector
                visitedCodes={visitedCodes}
                bucketCodes={bucketCodes}
                onToggleCountry={toggleBucket}
                onDone={saveBucket}
                saving={savingBucket}
              />
            </div>
          )}
          {panel === 'stats' && (
            <div className="absolute inset-0 overflow-y-auto p-4">
              <StatsPanel visitedCodes={visitedArray} bucketCodes={Array.from(bucketCodes)} bucketCount={bucketCodes.size} />
            </div>
          )}
        </div>

        <nav className="shrink-0 flex border-t border-gray-800 bg-gray-900">
          <MobileNavButton active={panel === 'map'} onClick={() => setPanel('map')} icon="🗺️" label="Map" />
          <MobileNavButton active={panel === 'list'} onClick={() => setPanel('list')} icon="✈️" label="Countries" />
          <MobileNavButton active={panel === 'bucket'} onClick={() => setPanel('bucket')} icon="⭐" label="Bucket" yellow />
          <MobileNavButton active={panel === 'stats'} onClick={() => setPanel('stats')} icon="📊" label="Stats" />
        </nav>
      </div>

      {isFirstVisit && panel === 'list' && (
        <div className="absolute bottom-20 md:hidden left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          Tap countries you have visited, then press Done
        </div>
      )}
    </div>
  )
}

function TabButton({
  active, onClick, children, yellow,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; yellow?: boolean
}) {
  const activeColor = yellow ? 'text-yellow-400 border-b-2 border-yellow-400' : 'theme-tab-active'
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors ${
        active ? activeColor : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function MobileNavButton({
  active, onClick, icon, label, yellow,
}: {
  active: boolean; onClick: () => void; icon: string; label: string; yellow?: boolean
}) {
  const activeColor = yellow ? 'text-yellow-400' : 'theme-text'
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
        active ? activeColor : 'text-gray-500'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
