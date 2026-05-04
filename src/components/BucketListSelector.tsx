'use client'

import { useState, useMemo } from 'react'
import { COUNTRIES, CONTINENTS, type Continent } from '@/data/countries'

interface BucketListSelectorProps {
  visitedCodes: Set<string>
  bucketCodes: Set<string>
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

export default function BucketListSelector({
  visitedCodes,
  bucketCodes,
  onToggleCountry,
  onDone,
  saving,
}: BucketListSelectorProps) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeContinent, setActiveContinent] = useState<Continent | 'All'>('All')

  const filtered = useMemo(() => {
    return COUNTRIES.filter((c) => {
      if (visitedCodes.has(c.code)) return false
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchContinent = activeContinent === 'All' || c.continent === activeContinent
      return matchSearch && matchContinent
    })
  }, [search, activeContinent, visitedCodes])

  const bucketCount = bucketCodes.size

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 space-y-3 overflow-x-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Places I want to go</h2>
            <p className="text-sm text-gray-400">
              {bucketCount === 0
                ? 'Add countries to your bucket list'
                : `${bucketCount} countr${bucketCount === 1 ? 'y' : 'ies'} on your list`}
            </p>
          </div>
          <button
            onClick={onDone}
            disabled={saving}
            className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 shrink-0"
          >
            {saving ? 'Saving…' : 'Done'}
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search countries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); window.scrollTo(0, 0) }}
            className="w-full px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {focused && search.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No countries found</p>
              ) : (
                filtered.slice(0, 8).map((country) => {
                  const inBucket = bucketCodes.has(country.code)
                  return (
                    <button
                      key={country.code}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { onToggleCountry(country.code); setSearch('') }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left ${inBucket ? 'bg-yellow-900/20' : ''}`}
                    >
                      <span className="text-lg shrink-0">{getFlagEmoji(country.code)}</span>
                      <span className={`flex-1 text-sm ${inBucket ? 'text-white font-medium' : 'text-gray-200'}`}>{country.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{country.continent}</span>
                      {inBucket && <span className="text-yellow-400 text-xs font-bold shrink-0">✓</span>}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['All', ...CONTINENTS] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActiveContinent(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeContinent === c
                  ? 'bg-yellow-500 text-gray-900'
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
          const inBucket = bucketCodes.has(country.code)
          return (
            <button
              key={country.code}
              onClick={() => onToggleCountry(country.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left ${
                inBucket ? 'bg-yellow-900/20' : ''
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  inBucket
                    ? 'bg-yellow-500 border-yellow-500'
                    : 'border-gray-500'
                }`}
              >
                {inBucket && (
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xl shrink-0">{getFlagEmoji(country.code)}</span>
              <span className={`flex-1 text-sm ${inBucket ? 'text-white font-medium' : 'text-gray-300'}`}>
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
