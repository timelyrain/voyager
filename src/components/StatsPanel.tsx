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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Countries" value={visitedCount} total={totalCountries} color="emerald" />
        <StatCard label="Continents" value={continentsVisited} total={6} color="blue" />
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
          <span className="text-sm font-bold text-emerald-400">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">By continent</p>
        {CONTINENTS.map((continent) => {
          const visited = byContinent[continent] || 0
          const total = continentTotals[continent]
          const pct = total > 0 ? Math.round((visited / total) * 100) : 0
          return (
            <div key={continent} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>{continent}</span>
                <span className="font-medium">{visited}/{total}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: CONTINENT_COLORS[continent] }}
                />
              </div>
            </div>
          )
        })}
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

function StatCard({
  label, value, total, color,
}: {
  label: string; value: number; total: number; color: 'emerald' | 'blue'
}) {
  const colorMap = { emerald: 'text-emerald-400', blue: 'text-blue-400' }
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className={`text-3xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">of {total}</div>
      <div className="text-xs font-medium text-gray-300 mt-1">{label}</div>
    </div>
  )
}
