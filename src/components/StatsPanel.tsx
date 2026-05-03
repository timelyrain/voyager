'use client'

import { COUNTRIES, CONTINENTS, CONTINENT_COLORS, groupByContinent, getCountryByCode, type Continent } from '@/data/countries'

interface StatsPanelProps {
  visitedCodes: string[]
  bucketCodes?: string[]
  bucketCount: number
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

function generateAchievements(visitedCodes: string[], bucketCodes: string[]): Achievement[] {
  const byContinent = groupByContinent(visitedCodes)
  const continentsVisited = CONTINENTS.filter((c) => byContinent[c] > 0).length
  const visited = visitedCodes.map((c) => getCountryByCode(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCountryByCode>>[]
  const n = visited.length

  return [
    // Country count milestones
    { emoji: '🛂', title: 'First Stamp',     desc: 'Visit your first country',   unlocked: n >= 1 },
    { emoji: '🎒', title: 'Wanderer',        desc: 'Visit 5 countries',          unlocked: n >= 5 },
    { emoji: '🧭', title: 'Explorer',        desc: 'Visit 10 countries',         unlocked: n >= 10 },
    { emoji: '🌍', title: 'Globetrotter',    desc: 'Visit 25 countries',         unlocked: n >= 25 },
    { emoji: '🌐', title: 'World Traveller', desc: 'Visit 50 countries',         unlocked: n >= 50 },
    { emoji: '💯', title: 'Century Club',    desc: 'Visit 100 countries',        unlocked: n >= 100 },
    // Continent milestones
    { emoji: '✈️', title: 'Bi-Continental',  desc: 'Set foot on 2 continents',   unlocked: continentsVisited >= 2 },
    { emoji: '🌏', title: 'Multi-Continental', desc: 'Set foot on 4 continents', unlocked: continentsVisited >= 4 },
    { emoji: '🏆', title: 'Full House',      desc: 'Conquer all 6 continents',   unlocked: continentsVisited >= 6 },
    // Regional
    { emoji: '🏯', title: 'Asia Explorer',   desc: '10 countries in Asia',       unlocked: (byContinent['Asia'] || 0) >= 10 },
    { emoji: '🏰', title: 'European Tour',   desc: '10 countries in Europe',     unlocked: (byContinent['Europe'] || 0) >= 10 },
    { emoji: '🦁', title: 'Africa Adventurer', desc: '5 countries in Africa',    unlocked: (byContinent['Africa'] || 0) >= 5 },
    // Special
    { emoji: '⭐', title: 'Top 5',           desc: 'Visit the 5 most visited countries', unlocked: ['FR','ES','US','CN','IT'].every((c) => visitedCodes.includes(c)) },
    { emoji: '💎', title: 'Hidden Gem',      desc: 'Visit a country ranked outside top 100', unlocked: visited.some((c) => c.rank > 100) },
    { emoji: '📝', title: 'Bucket Dreamer',  desc: '10+ countries on bucket list', unlocked: bucketCodes.length >= 10 },
  ]
}

function generateFunFacts(visitedCodes: string[], bucketCodes: string[]): FunFact[] {
  const visited = visitedCodes.map((c) => getCountryByCode(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCountryByCode>>[]
  if (visited.length === 0) return []

  const facts: FunFact[] = []
  const byContinent = groupByContinent(visitedCodes)
  const continentTotals = Object.fromEntries(
    CONTINENTS.map((c) => [c, COUNTRIES.filter((co) => co.continent === c).length])
  ) as Record<Continent, number>

  // 1. World explorer percentile (avg person visits ~11 countries)
  const worldAvg = 11
  if (visited.length >= worldAvg) {
    facts.push({
      emoji: '✈️',
      title: 'World explorer',
      body: `With ${visited.length} countries visited, you've explored more of the world than the average person ever will in a lifetime.`,
    })
  } else {
    const remaining = worldAvg - visited.length
    facts.push({
      emoji: '✈️',
      title: 'Just getting started',
      body: `You've visited ${visited.length} countries so far. Visit ${remaining} more to beat the global average of ${worldAvg} countries per person.`,
    })
  }

  // 2. Rarest / most off-the-beaten-path destination
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

  // 3. Most explored continent
  const mostExplored = CONTINENTS.filter((c) => byContinent[c] > 0).reduce((a, b) => {
    const pctA = byContinent[a] / continentTotals[a]
    const pctB = byContinent[b] / continentTotals[b]
    return pctA > pctB ? a : b
  })
  const exploredPct = Math.round((byContinent[mostExplored] / continentTotals[mostExplored]) * 100)
  facts.push({
    emoji: '🗺️',
    title: `${mostExplored} specialist`,
    body: `You've visited ${byContinent[mostExplored]} of ${continentTotals[mostExplored]} countries in ${mostExplored} — that's ${exploredPct}% of the continent conquered.`,
  })

  // 4. Continents milestone
  const continentsVisited = CONTINENTS.filter((c) => byContinent[c] > 0).length
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

  // 5. Bucket list insight
  if (bucketCodes.length > 0) {
    const bucketCountries = bucketCodes.map((c) => getCountryByCode(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCountryByCode>>[]
    const mostWanted = bucketCountries.reduce((a, b) => (a.rank < b.rank ? a : b))
    facts.push({
      emoji: '⭐',
      title: 'Next big adventure',
      body: `${mostWanted.name} is the hottest destination on your bucket list — ranked #${mostWanted.rank} most visited in the world. It's calling your name!`,
    })
  }

  // 6. Country count milestones
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

export default function StatsPanel({ visitedCodes, bucketCodes = [], bucketCount }: StatsPanelProps) {
  const totalCountries = COUNTRIES.length
  const visitedCount = visitedCodes.length
  const percentage = totalCountries > 0 ? Math.round((visitedCount / totalCountries) * 100) : 0

  const byContinent = groupByContinent(visitedCodes)
  const continentTotals = Object.fromEntries(
    CONTINENTS.map((c) => [c, COUNTRIES.filter((co) => co.continent === c).length])
  )
  const continentsVisited = CONTINENTS.filter((c) => byContinent[c] > 0).length
  const funFacts = generateFunFacts(visitedCodes, bucketCodes)
  const achievements = generateAchievements(visitedCodes, bucketCodes)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatDial label="Countries" value={visitedCount} total={totalCountries} color="var(--accent)" />
        <StatDial label="Continents" value={continentsVisited} total={6} color="#3b82f6" />
      </div>

      <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">Bucket list</div>
          <div className="text-sm font-medium text-gray-200 mt-0.5">
            {bucketCount} countr{bucketCount === 1 ? 'y' : 'ies'} to visit
          </div>
        </div>
        <div className="text-2xl font-bold text-yellow-400">{bucketCount}</div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">World coverage</span>
          <span className="text-sm font-bold theme-text">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full theme-bar rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">By continent</p>
        <div className="grid grid-cols-3 gap-4">
          {CONTINENTS.map((continent) => {
            const visited = byContinent[continent] || 0
            const total = continentTotals[continent]
            return (
              <ContinentDial key={continent} continent={continent} visited={visited} total={total} color={CONTINENT_COLORS[continent]} />
            )
          })}
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
                a.unlocked
                  ? 'theme-badge-unlocked'
                  : 'bg-gray-800/20 border border-gray-800/40 opacity-25'
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

function StatDial({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const size = 108
  const strokeWidth = 8
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct = total > 0 ? value / total : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-2">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white leading-none">{value}</span>
          <span className="text-xs text-gray-400 mt-1">of {total}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-300">{label}</span>
    </div>
  )
}

function ContinentDial({ continent, visited, total, color }: {
  continent: string; visited: number; total: number; color: string
}) {
  const size = 72
  const strokeWidth = 6
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct = total > 0 ? visited / total : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1.5">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white leading-none">{visited}</span>
          <span className="text-[9px] text-gray-400 leading-none mt-0.5">/{total}</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 text-center leading-tight">{continent}</span>
    </div>
  )
}
