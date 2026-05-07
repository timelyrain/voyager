'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import CountrySelector from '@/components/CountrySelector'
import StatsPanel from '@/components/StatsPanel'
import ShareModal from '@/components/ShareModal'
import ThemeSelector from '@/components/ThemeSelector'
import QuoteBanner from '@/components/QuoteBanner'
import CountryJournal from '@/components/CountryJournal'
import { useTheme } from '@/context/ThemeContext'
import { type ThemeId } from '@/lib/themes'
import type { User } from '@supabase/supabase-js'
import { pacifico } from '@/lib/fonts'

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false })

type Panel = 'map' | 'list' | 'stats'

function generateShortKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const arr = new Uint8Array(10)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => chars[b % chars.length]).join('')
}

function getShareUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  return `${base}/u/${key}`
}

async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const res = await fetch(`/api/shorten?url=${encodeURIComponent(longUrl)}`)
    if (res.ok) {
      const { url } = await res.json()
      if (url) return url
    }
  } catch {}
  return longUrl
}

function toggleSet<T>(prev: Set<T>, item: T): Set<T> {
  const next = new Set(prev)
  if (next.has(item)) next.delete(item)
  else next.add(item)
  return next
}

async function syncCountryCodes(
  table: 'visited_countries' | 'bucketlist_countries',
  currentCodes: Set<string>,
  userId: string
): Promise<string[]> {
  const supabase = createClient()
  const { data: existing } = await supabase.from(table).select('country_code').eq('user_id', userId)
  const existingSet = new Set((existing || []).map((r: { country_code: string }) => r.country_code))
  const toAdd = Array.from(currentCodes).filter((c) => !existingSet.has(c))
  const toRemove = Array.from(existingSet).filter((c) => !currentCodes.has(c))
  if (toAdd.length > 0) {
    await supabase.from(table).insert(toAdd.map((country_code) => ({ user_id: userId, country_code })))
  }
  if (toRemove.length > 0) {
    await supabase.from(table).delete().eq('user_id', userId).in('country_code', toRemove)
  }
  return toAdd
}

export default function MapPage() {
  const { setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [visitedCodes, setVisitedCodes] = useState<Set<string>>(new Set())
  const [bucketCodes, setBucketCodes] = useState<Set<string>>(new Set())
  const [panel, setPanel] = useState<Panel>('map')
  const [shareKey, setShareKey] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [savingVisited, setSavingVisited] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(288)
  const [journalCountryCode, setJournalCountryCode] = useState<string | null>(null)
  const [citiesVisited, setCitiesVisited] = useState<string[]>([])
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const VALID_THEME_IDS: ThemeId[] = ['passport', 'vintage', 'airline', 'journal', 'celestial']

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (!user) return

        const [{ data: visited }, { data: bucket }, { data: profile }, { data: journals }] = await Promise.all([
          supabase.from('visited_countries').select('country_code').eq('user_id', user.id),
          supabase.from('bucketlist_countries').select('country_code').eq('user_id', user.id),
          supabase.from('profiles').select('share_key, theme').eq('user_id', user.id).maybeSingle(),
          supabase.from('country_journals').select('cities_visited').eq('user_id', user.id),
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
        if (profile?.theme && VALID_THEME_IDS.includes(profile.theme as ThemeId)) {
          setTheme(profile.theme as ThemeId)
        }
        if (journals) setCitiesVisited(journals.flatMap((j: { cities_visited: string[] }) => j.cities_visited || []))
      } catch (err) {
        console.error('[load] failed to load user data:', err)
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [])

  const toggleVisited = useCallback((code: string) => setVisitedCodes((prev) => toggleSet(prev, code)), [])
  const toggleBucket = useCallback((code: string) => setBucketCodes((prev) => toggleSet(prev, code)), [])

  async function saveVisited() {
    if (!user) return
    setSavingVisited(true)
    try {
      const toAdd = await syncCountryCodes('visited_countries', visitedCodes, user.id)
      let finalBucketCodes = bucketCodes
      if (toAdd.length > 0) {
        finalBucketCodes = new Set(bucketCodes)
        toAdd.forEach((c) => finalBucketCodes.delete(c))
        setBucketCodes(finalBucketCodes)
      }
      await syncCountryCodes('bucketlist_countries', finalBucketCodes, user.id)
    } catch (err) {
      console.error('[saveVisited] sync failed:', err)
    }
    setSavingVisited(false)
    setIsFirstVisit(false)
    setPanel('stats')
  }

  async function handleShareClick() {
    if (!user) return
    setShareLoading(true)
    let key = shareKey
    if (!key) {
      const supabase = createClient()
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
      const shortKey = generateShortKey()
      const { data } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, display_name: displayName, share_key: shortKey })
        .select('share_key')
        .single()
      key = data?.share_key ?? null
      if (key) setShareKey(key)
    }
    if (key) {
      const url = await shortenUrl(getShareUrl(key))
      setShareUrl(url)
    }
    setShareLoading(false)
    if (key) setShowShareModal(true)
  }

  async function handleRegenerate() {
    if (!user) return
    const newKey = generateShortKey()
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ share_key: newKey }).eq('user_id', user.id)
    if (error) return
    setShareUrl(null)
    setShareKey(newKey)
    const url = await shortenUrl(getShareUrl(newKey))
    setShareUrl(url)
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

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#0f172a]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const visitedArray = Array.from(visitedCodes)
  const bucketArray = Array.from(bucketCodes)

  return (
    <div className="flex flex-col h-dvh text-white relative overflow-hidden">
      {showShareModal && shareKey && (
        <ShareModal
          url={shareUrl || getShareUrl(shareKey)}
          visitedCount={visitedCodes.size}
          onClose={() => setShowShareModal(false)}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* Night sky wallpaper */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, #010409 0%, #040d24 18%, #0a1e4a 42%, #132344 55%, #0e1a38 70%, #0f172a 84%, #060f1c 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 160% 28% at 50% 100%, rgba(245,158,11,0.22) 0%, rgba(220,38,38,0.1) 30%, rgba(99,102,241,0.07) 55%, transparent 72%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 90% at -5% 30%, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.12) 35%, transparent 65%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 90% at 105% 20%, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.1) 35%, transparent 65%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: [
          'radial-gradient(1px 1px at 8% 10%, rgba(255,255,255,0.9), transparent)',
          'radial-gradient(1.5px 1.5px at 22% 6%, rgba(255,255,255,0.7), transparent)',
          'radial-gradient(1px 1px at 38% 14%, rgba(200,220,255,0.8), transparent)',
          'radial-gradient(1px 1px at 53% 5%, rgba(255,255,255,0.6), transparent)',
          'radial-gradient(1.5px 1.5px at 68% 11%, rgba(255,255,255,0.85), transparent)',
          'radial-gradient(1px 1px at 79% 8%, rgba(200,220,255,0.7), transparent)',
          'radial-gradient(1px 1px at 91% 16%, rgba(255,255,255,0.5), transparent)',
          'radial-gradient(1px 1px at 14% 24%, rgba(255,255,255,0.4), transparent)',
          'radial-gradient(1px 1px at 46% 20%, rgba(255,255,255,0.45), transparent)',
          'radial-gradient(1.5px 1.5px at 62% 18%, rgba(200,220,255,0.4), transparent)',
          'radial-gradient(1px 1px at 85% 27%, rgba(255,255,255,0.35), transparent)',
        ].join(', '),
      }} />

      <header className="flex items-center justify-between px-4 py-3 shrink-0 relative z-20" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10.5" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.75"/>
            <path d="M12 1.5 L13.3 4.2 L10.7 4.2 Z" fill="white"/>
            {/* Major ticks: E, S, W */}
            <line x1="22.5" y1="12"   x2="20.8" y2="12"   stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
            <line x1="12"   y1="22.5" x2="12"   y2="20.8"  stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
            <line x1="1.5"  y1="12"   x2="3.2"  y2="12"   stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
            {/* Intercardinal ticks: NE, SE, SW, NW */}
            <line x1="19.42" y1="4.58"  x2="18.51" y2="5.49"  stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            <line x1="19.42" y1="19.42" x2="18.51" y2="18.51" stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            <line x1="4.58"  y1="19.42" x2="5.49"  y2="18.51" stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            <line x1="4.58"  y1="4.58"  x2="5.49"  y2="5.49"  stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            {/* Minor ticks at 30° intervals */}
            <line x1="17.25" y1="2.91"  x2="16.75" y2="3.77"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="21.09" y1="6.75"  x2="20.23" y2="7.25"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="21.09" y1="17.25" x2="20.23" y2="16.75" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="17.25" y1="21.09" x2="16.75" y2="20.23" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="6.75"  y1="21.09" x2="7.25"  y2="20.23" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="2.91"  y1="17.25" x2="3.77"  y2="16.75" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="2.91"  y1="6.75"  x2="3.77"  y2="7.25"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="6.75"  y1="2.91"  x2="7.25"  y2="3.77"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            {/* Red direction indicator */}
            <g transform="rotate(90, 12, 12)">
              <path d="M12 4.8 L11 6.5 L13 6.5 Z" fill="#ef4444"/>
            </g>
            <circle cx="12" cy="12" r="1.5" fill="white"/>
            <circle cx="12" cy="12" r="0.6" fill="rgba(0,0,0,0.7)"/>
          </svg>
          <span className={`${pacifico.className} text-2xl theme-text`}>Travelogue</span>
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

      <QuoteBanner />

      <div className="hidden md:flex flex-1 overflow-hidden relative z-10">
        <div style={{ width: sidebarWidth }} className="shrink-0 flex flex-col overflow-hidden bg-gray-900/30 backdrop-blur-md">
          <div className="flex border-b border-gray-800">
            <TabButton active={panel === 'stats'} onClick={() => setPanel('stats')}>My Log</TabButton>
            <TabButton active={panel === 'list'} onClick={() => setPanel('list')}>Countries</TabButton>
          </div>
          <div className="flex-1 overflow-hidden">
            {panel === 'stats' && (
              <div className="p-4 overflow-y-auto h-full">
                <StatsPanel visitedCodes={visitedArray} bucketCodes={bucketArray} bucketCount={bucketCodes.size} citiesVisited={citiesVisited} />
              </div>
            )}
            {panel === 'list' && (
              <CountrySelector
                visitedCodes={visitedCodes}
                bucketCodes={bucketCodes}
                onToggleCountry={toggleVisited}
                onToggleBucket={toggleBucket}
                onDone={saveVisited}
                saving={savingVisited}
                onOpenJournal={user ? setJournalCountryCode : undefined}
              />
            )}
          </div>
        </div>

        <div
          onMouseDown={handleDividerMouseDown}
          className="w-1 shrink-0 bg-gray-800 hover:bg-emerald-500/60 active:bg-emerald-500 cursor-col-resize transition-colors select-none"
        />

        <div className="flex-1 p-3 overflow-hidden">
          <WorldMap visitedCodes={visitedCodes} bucketCodes={bucketCodes} onToggleCountry={toggleVisited} onOpenJournal={user ? setJournalCountryCode : undefined} />
        </div>
      </div>

      <div className="md:hidden flex-1 overflow-hidden flex flex-col relative z-10">
        <div className="flex-1 overflow-hidden relative">
          {panel === 'map' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
<div className="w-full shrink-0" style={{ aspectRatio: '4/3' }}>
                <WorldMap visitedCodes={visitedCodes} bucketCodes={bucketCodes} onToggleCountry={toggleVisited} onOpenJournal={user ? setJournalCountryCode : undefined} />
              </div>
              <div className="flex-1 flex items-center justify-around px-6 border-t border-gray-800/40">
                <div className="text-center">
                  <div className="text-3xl font-bold theme-text">{visitedCodes.size}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">countries</div>
                </div>
                <div className="w-px h-10 bg-gray-700/50" />
                <div className="text-center">
                  <div className="text-3xl font-bold theme-text">{Math.round(visitedCodes.size / 195 * 100)}%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">of world</div>
                </div>
                <div className="w-px h-10 bg-gray-700/50" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-400">{bucketCodes.size}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">bucket list</div>
                </div>
              </div>
            </div>
          )}
          {panel === 'list' && (
            <div className="absolute inset-0 overflow-hidden flex flex-col bg-gray-900/40 backdrop-blur-md">
              <CountrySelector
                visitedCodes={visitedCodes}
                bucketCodes={bucketCodes}
                onToggleCountry={toggleVisited}
                onToggleBucket={toggleBucket}
                onDone={saveVisited}
                saving={savingVisited}
                onOpenJournal={user ? setJournalCountryCode : undefined}
              />
            </div>
          )}
          {panel === 'stats' && (
            <div className="absolute inset-0 overflow-y-auto p-4 bg-gray-900/40 backdrop-blur-md">
              <StatsPanel visitedCodes={visitedArray} bucketCodes={bucketArray} bucketCount={bucketCodes.size} citiesVisited={citiesVisited} />
            </div>
          )}
        </div>

        <nav className="shrink-0 flex border-t border-gray-800/60 bg-gray-900" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <MobileNavButton active={panel === 'stats'} onClick={() => setPanel('stats')} icon="🧳" label="My Log" />
          <MobileNavButton active={panel === 'map'} onClick={() => setPanel('map')} icon="🗺️" label="Map" />
          <MobileNavButton active={panel === 'list'} onClick={() => setPanel('list')} icon="✈️" label="Countries" />
        </nav>
      </div>

      {isFirstVisit && panel === 'list' && (
        <div className="absolute bottom-20 md:hidden left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap z-20">
          Tap countries you have visited, then press Done
        </div>
      )}

      {journalCountryCode && user && (
        <CountryJournal
          countryCode={journalCountryCode}
          userId={user.id}
          onClose={() => setJournalCountryCode(null)}
        />
      )}
    </div>
  )
}

function TabButton({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors ${
        active ? 'theme-tab-active' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function MobileNavButton({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void; icon: string; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
        active ? 'theme-text' : 'text-gray-500'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
