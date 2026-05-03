'use client'

import { useState, useMemo } from 'react'
import { COUNTRIES, CONTINENTS, type Continent } from '@/data/countries'

interface CountrySelectorProps {
  visitedCodes: Set<string>
  onToggleCountry: (code: string) => void
  onDone: () => void
  saving: boolean
}

function getFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('')
}

export default function CountrySelector({
  visitedCodes,
  onToggleCountry,
  onDone,
  saving,
}: CountrySelectorProps) {
  const [search, setSearch] = useState('')
  const [activeContinent, setActiveContinent] = useState<Continent | 'All'>('All')

  const filtered = useMemo(() => {
    return COUNTRIES.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchContinent = activeContinent === 'All' || c.continent === activeContinent
      return matchSearch && matchContinent
    })
  }, [search, activeContinent])

  const visitedCount = visitedCodes.size

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Where have you been?</h2>
            <p className="text-sm text-gray-400">
              {visitedCount === 0
                ? 'Select countries you have visited'
                : `${visitedCount} countr${visitedCount === 1 ? 'y' : 'ies'} selected`}
            </p>
          </div>
          <button
            onClick={onDone}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {saving ? 'Saving…' : 'Done'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search countries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {(['All', ...CONTINENTS] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActiveContinent(c)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeContinent === c
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-700/50">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10 text-sm">No countries found</p>
        )}
        {filtered.map((country) => {
          const visited = visitedCodes.has(country.code)
          return (
            <button
              key={country.code}
              onClick={() => onToggleCountry(country.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left ${
                visited ? 'bg-red-900/20' : ''
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  visited
                    ? 'bg-red-600 border-red-600'
                    : 'border-gray-500'
                }`}
              >
                {visited && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xl shrink-0">{getFlagEmoji(country.code)}</span>
              <span className={`flex-1 text-sm ${visited ? 'text-white font-medium' : 'text-gray-300'}`}>
                {country.name}
              </span>
              <span className="text-xs text-gray-500 shrink-0">{country.continent}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
