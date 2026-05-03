'use client'

import { COUNTRIES, CONTINENTS, CONTINENT_COLORS, groupByContinent } from '@/data/countries'

interface StatsPanelProps {
  visitedCodes: string[]
}

export default function StatsPanel({ visitedCodes }: StatsPanelProps) {
  const totalCountries = COUNTRIES.length
  const visitedCount = visitedCodes.length
  const percentage = totalCountries > 0 ? Math.round((visitedCount / totalCountries) * 100) : 0

  const byContinent = groupByContinent(visitedCodes)
  const continentTotals = Object.fromEntries(
    CONTINENTS.map((c) => [c, COUNTRIES.filter((co) => co.continent === c).length])
  )
  const continentsVisited = CONTINENTS.filter((c) => byContinent[c] > 0).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Countries" value={visitedCount} total={totalCountries} color="emerald" />
        <StatCard label="Continents" value={continentsVisited} total={6} color="blue" />
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
                  style={{
                    width: `${pct}%`,
                    backgroundColor: CONTINENT_COLORS[continent],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: 'emerald' | 'blue'
}) {
  const colorMap = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  }
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className={`text-3xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">of {total} {label.toLowerCase()}</div>
      <div className="text-xs font-medium text-gray-300 mt-1">{label}</div>
    </div>
  )
}
