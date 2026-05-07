'use client'

import { useMemo } from 'react'
import { COUNTRIES, CONTINENTS, CONTINENT_COLORS, CONTINENT_TOTALS, groupByContinent, getCountryByCode, type Continent } from '@/data/countries'
import { COUNTRY_CITIES } from '@/data/cities'

export const OFF_THE_MAP = 'Off the Map'

interface StatsPanelProps {
  visitedCodes: string[]
  bucketCodes?: string[]
  bucketCount: number
  citiesVisited?: string[]
}

interface FunFact {
  emoji: string
  title: string
  body: string
}

interface Achievement {
  emoji: string
  title: string
  desc: string
  unlocked: boolean
}

function generateAchievements(
  visitedCodes: string[],
  bucketCodes: string[],
  byContinent: Record<Continent, number>
): Achievement[] {
  const continentsVisited = CONTINENTS.filter((c) => byContinent[c] > 0).length
  const visited = visitedCodes.map((c) => getCountryByCode(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCountryByCode>>[]
  const n = visited.length

  return [
    { emoji: '🛂', title: 'First Stamp',       desc: 'Visit your first country',              unlocked: n >= 1 },
    { emoji: '🎒', title: 'Wanderer',           desc: 'Visit 5 countries',                     unlocked: n >= 5 },
    { emoji: '🧭', title: 'Explorer',           desc: 'Visit 10 countries',                    unlocked: n >= 10 },
    { emoji: '🌍', title: 'Globetrotter',       desc: 'Visit 25 countries',                    unlocked: n >= 25 },
    { emoji: '🌐', title: 'World Traveller',    desc: 'Visit 50 countries',                    unlocked: n >= 50 },
    { emoji: '💯', title: 'Century Club',       desc: 'Visit 100 countries',                   unlocked: n >= 100 },
    { emoji: '✈️', title: 'Bi-Continental',     desc: 'Set foot on 2 continents',              unlocked: continentsVisited >= 2 },
    { emoji: '🌏', title: 'Multi-Continental',  desc: 'Set foot on 4 continents',              unlocked: continentsVisited >= 4 },
    { emoji: '🏆', title: 'Full House',         desc: 'Conquer all 6 continents',              unlocked: continentsVisited >= 6 },
    { emoji: '🏯', title: 'Asia Explorer',      desc: '10 countries in Asia',                  unlocked: (byContinent['Asia'] || 0) >= 10 },
    { emoji: '🏰', title: 'European Tour',      desc: '10 countries in Europe',                unlocked: (byContinent['Europe'] || 0) >= 10 },
    { emoji: '🦁', title: 'Africa Adventurer',  desc: '5 countries in Africa',                 unlocked: (byContinent['Africa'] || 0) >= 5 },
    { emoji: '⭐', title: 'Top 5',              desc: 'Visit the 5 most visited countries',    unlocked: ['FR','ES','US','CN','IT'].every((c) => visitedCodes.includes(c)) },
    { emoji: '💎', title: 'Hidden Gem',         desc: 'Visit a country ranked outside top 100', unlocked: visited.some((c) => c.rank > 100) },
    { emoji: '📝', title: 'Bucket Dreamer',     desc: '10+ countries on bucket list',          unlocked: bucketCodes.length >= 10 },
  ]
}

function generateFunFacts(
  visitedCodes: string[],
  bucketCodes: string[],
  byContinent: Record<Continent, number>
): FunFact[] {
  const visited = visitedCodes.map((c) => getCountryByCode(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCountryByCode>>[]
  if (visited.length === 0) return []

  const facts: FunFact[] = []

  const worldAvg = 11
  if (visited.length >= worldAvg) {
    facts.push({
      emoji: '✈️',
      title: 'World explorer',
      body: `With ${visited.length} countries visited, you've explored more of the world than the average person ever will in a lifetime.`,
    })
  } else {
    facts.push({
      emoji: '✈️',
      title: 'Just getting started',
      body: `You've visited ${visited.length} countries so far. Visit ${worldAvg - visited.length} more to beat the global average of ${worldAvg} countries per person.`,
    })
  }

  const rarest = visited.reduce((a, b) => (a.rank > b.rank ? a : b))
  if (rarest.rank > 50) {
    facts.push({
      emoji: '💎',
      title: 'Hidden gem finder',
      body: `${rarest.name} is your most off-the-beaten-path destination — ranked #${rarest.rank} globally for tourism. Not many people go there!`,
    })
  } else {
    facts.push({
      emoji: '🌟',
      title: 'Top destination visited',
      body: `${rarest.name} is one of the world's most popular destinations and you've been there — ranked #${rarest.rank} globally for tourism.`,
    })
  }

  const visitedContinents = CONTINENTS.filter((c) => byContinent[c] > 0)
  if (visitedContinents.length > 0) {
    const mostExplored = visitedContinents.reduce((a, b) =>
      byContinent[a] / CONTINENT_TOTALS[a] > byContinent[b] / CONTINENT_TOTALS[b] ? a : b
    )
    const exploredPct = Math.round((byContinent[mostExplored] / CONTINENT_TOTALS[mostExplored]) * 100)
    facts.push({
      emoji: '🗺️',
      title: `${mostExplored} specialist`,
      body: `You've visited ${byContinent[mostExplored]} of ${CONTINENT_TOTALS[mostExplored]} countries in ${mostExplored} — that's ${exploredPct}% of the continent conquered.`,
    })
  }

  const continentsVisited = visitedContinents.length
  if (continentsVisited >= 6) {
    facts.push({
      emoji: '🏆',
      title: 'Almost a full house',
      body: `You've set foot on ${continentsVisited} out of 7 continents. Only Antarctica stands between you and the ultimate travel achievement!`,
    })
  } else if (continentsVisited >= 4) {
    const missing = CONTINENTS.filter((c) => byContinent[c] === 0)
    facts.push({
      emoji: '🌐',
      title: 'Multi-continental',
      body: `${continentsVisited} continents explored! Add ${missing[0]} to your list next to keep expanding your world.`,
    })
  }

  if (bucketCodes.length > 0) {
    const bucketCountries = bucketCodes.map((c) => getCountryByCode(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCountryByCode>>[]
    const mostWanted = bucketCountries.reduce((a, b) => (a.rank < b.rank ? a : b))
    facts.push({
      emoji: '⭐',
      title: 'Next big adventure',
      body: `${mostWanted.name} is the hottest destination on your bucket list — ranked #${mostWanted.rank} most visited in the world. It's calling your name!`,
    })
  }

  const milestones = [10, 25, 50, 75, 100, 150]
  const nextMilestone = milestones.find((m) => m > visited.length)
  if (nextMilestone) {
    const gap = nextMilestone - visited.length
    facts.push({
      emoji: '🎯',
      title: `${nextMilestone} countries challenge`,
      body: `You're only ${gap} countr${gap === 1 ? 'y' : 'ies'} away from hitting the ${nextMilestone}-country milestone. Where will you go next?`,
    })
  }

  return facts.slice(0, 5)
}

export default function StatsPanel({ visitedCodes, bucketCodes = [], bucketCount, citiesVisited = [] }: StatsPanelProps) {
  const visitedCount = visitedCodes.length
  const totalCountries = COUNTRIES.length
  const percentage = totalCountries > 0 ? Math.round((visitedCount / totalCountries) * 100) : 0

  const byContinent = useMemo(() => groupByContinent(visitedCodes), [visitedCodes])
  const continentsVisited = useMemo(() => CONTINENTS.filter((c) => byContinent[c] > 0).length, [byContinent])
  const funFacts = useMemo(() => generateFunFacts(visitedCodes, bucketCodes, byContinent), [visitedCodes, bucketCodes, byContinent])
  const achievements = useMemo(() => generateAchievements(visitedCodes, bucketCodes, byContinent), [visitedCodes, bucketCodes, byContinent])
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  const totalCitiesAvailable = useMemo(() => visitedCodes.reduce((sum, code) => sum + (COUNTRY_CITIES[code]?.length ?? 0), 0), [visitedCodes])
  const citiesVisitedCount = useMemo(() => citiesVisited.filter(c => c !== OFF_THE_MAP).length, [citiesVisited])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <StatDial label="Continents" value={continentsVisited} total={6} color="#3b82f6" />
        <StatDial label="Countries" value={visitedCount} total={totalCountries} color="var(--accent)" />
        <StatDial label="Destinations" value={citiesVisitedCount} total={Math.max(totalCitiesAvailable, citiesVisitedCount)} color="#a855f7" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Bucket list</span>
          <span className="text-sm font-bold text-yellow-400">{bucketCount} {bucketCount === 1 ? 'country' : 'countries'}</span>
        </div>
        {bucketCount === 0 ? (
          <div className="text-sm text-gray-500">No countries added yet</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(bucketCodes ?? []).map((code) => {
              const country = getCountryByCode(code)
              if (!country) return null
              const flag = [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('')
              return (
                <span key={code} className="flex items-center gap-1 bg-gray-700 rounded-full px-2 py-0.5 text-xs text-gray-200">
                  {flag} {country.name}
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">World coverage</span>
          <span className="text-sm font-bold theme-text">{visitedCount} {visitedCount === 1 ? 'country' : 'countries'}</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div className="h-full theme-bar rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
        {visitedCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visitedCodes.map((code) => {
              const country = getCountryByCode(code)
              if (!country) return null
              const flag = [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('')
              return (
                <span key={code} className="flex items-center gap-1 bg-gray-700 rounded-full px-2 py-0.5 text-xs text-gray-200">
                  {flag} {country.name}
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">By continent</p>
        <div className="grid grid-cols-3 gap-4">
          {CONTINENTS.map((continent) => (
            <ContinentDial
              key={continent}
              continent={continent}
              visited={byContinent[continent] || 0}
              total={CONTINENT_TOTALS[continent]}
              color={CONTINENT_COLORS[continent]}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Achievements</p>
          <span className="text-xs text-gray-500">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map((a) => (
            <div
              key={a.title}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                a.unlocked ? 'theme-badge-unlocked' : 'bg-gray-800/20 border border-gray-800/40 opacity-25'
              }`}
            >
              <span className="text-xl shrink-0">{a.emoji}</span>
              <div className="min-w-0">
                <div className={`text-xs font-bold leading-tight truncate ${a.unlocked ? 'theme-badge-title' : 'text-gray-400'}`}>{a.title}</div>
                <div className="text-[10px] text-gray-500 leading-tight mt-0.5 truncate">{a.desc}</div>
              </div>
              {a.unlocked && <span className="ml-auto theme-badge-check text-xs font-bold shrink-0">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {funFacts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fun facts</p>
          {funFacts.map((fact, i) => (
            <div key={i} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{fact.emoji}</span>
                <span className="text-sm font-semibold text-white">{fact.title}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed pl-7">{fact.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ArcDial({ size, strokeWidth, value, total, color, children }: {
  size: number; strokeWidth: number; value: number; total: number; color: string; children: React.ReactNode
}) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - (total > 0 ? value / total : 0))
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#374151" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ stroke: color, transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

function StatDial({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-2">
      <ArcDial size={80} strokeWidth={6} value={value} total={total} color={color}>
        <span className="text-xl font-bold text-white leading-none">{value}</span>
        <span className="text-[10px] text-gray-400 mt-0.5">of {total}</span>
      </ArcDial>
      <span className="text-[11px] font-medium text-gray-300">{label}</span>
    </div>
  )
}

function ContinentDial({ continent, visited, total, color }: {
  continent: string; visited: number; total: number; color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <ArcDial size={72} strokeWidth={6} value={visited} total={total} color={color}>
        <span className="text-sm font-bold text-white leading-none">{visited}</span>
        <span className="text-[9px] text-gray-400 leading-none mt-0.5">/{total}</span>
      </ArcDial>
      <span className="text-[10px] text-gray-400 text-center leading-tight">{continent}</span>
    </div>
  )
}
