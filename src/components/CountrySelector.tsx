'use client'

import { useState, useMemo } from 'react'
import { COUNTRIES, CONTINENTS, type Continent } from '@/data/countries'

interface CountrySelectorProps {
  visitedCodes: Set<string>
  bucketCodes?: Set<string>
  onToggleCountry: (code: string) => void
  onToggleBucket?: (code: string) => void
  onDone: () => void
  saving: boolean
  onOpenJournal?: (code: string) => void
}

function getFlagEmoji(code: string) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('')
}

export default function CountrySelector({
  visitedCodes,
  bucketCodes,
  onToggleCountry,
  onToggleBucket,
  onDone,
  saving,
  onOpenJournal,
}: CountrySelectorProps) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeContinent, setActiveContinent] = useState<Continent | 'All'>('All')

  const filtered = useMemo(() => {
    const group = (code: string) => {
      if (visitedCodes.has(code)) return 0
      if (bucketCodes?.has(code)) return 1
      return 2
    }
    return COUNTRIES.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchContinent = activeContinent === 'All' || c.continent === activeContinent
      return matchSearch && matchContinent
    }).sort((a, b) => group(a.code) - group(b.code))
  }, [search, activeContinent])

  const visitedCount = visitedCodes.size

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 space-y-3 overflow-x-hidden">
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
            className="theme-btn px-4 py-2 text-sm font-semibold rounded-lg shrink-0"
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
            className="w-full px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-[16px] focus:outline-none theme-ring"
          />
          {focused && search.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No countries found</p>
              ) : (
                filtered.slice(0, 8).map((country) => {
                  const visited = visitedCodes.has(country.code)
                  return (
                    <button
                      key={country.code}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { onToggleCountry(country.code); setSearch('') }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left ${visited ? 'theme-row-selected' : ''}`}
                    >
                      <span className="text-lg shrink-0">{getFlagEmoji(country.code)}</span>
                      <span className={`flex-1 text-sm ${visited ? 'text-white font-medium' : 'text-gray-200'}`}>{country.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{country.continent}</span>
                      {visited && <span className="theme-text text-xs font-bold shrink-0">✓</span>}
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
                  ? 'theme-pill-active'
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
            <div
              key={country.code}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${visited ? 'theme-row-selected' : ''}`}
            >
              <button
                onClick={() => onToggleCountry(country.code)}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    visited ? 'theme-circle-selected' : 'border-gray-500'
                  }`}
                >
                  {visited && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xl shrink-0">{getFlagEmoji(country.code)}</span>
                <span className="flex-1 min-w-0">
                  <span className={`text-sm ${visited ? 'text-white font-medium' : 'text-gray-300'}`}>{country.name}</span>
                  <span className="ml-1.5 text-xs text-gray-500">{country.continent}</span>
                </span>
              </button>
              {onToggleBucket && (
                <div className="relative group/bucket shrink-0">
                  <button
                    onClick={() => !visited && onToggleBucket(country.code)}
                    disabled={visited}
                    className={`p-1.5 rounded-lg transition-colors ${
                      visited
                        ? 'text-gray-700 cursor-default'
                        : bucketCodes?.has(country.code)
                          ? 'text-rose-400 hover:text-rose-300 hover:bg-gray-700'
                          : 'text-rose-400/60 hover:text-rose-400 hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      fill={!visited && bucketCodes?.has(country.code) ? 'currentColor' : 'none'}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                  {!visited && (
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-gray-800 text-gray-200 text-xs whitespace-nowrap opacity-0 group-hover/bucket:opacity-100 transition-none">
                      Bucket list
                    </span>
                  )}
                </div>
              )}
              {onOpenJournal && (
                <div className="relative group/journal shrink-0">
                  <button
                    onClick={() => visited && onOpenJournal(country.code)}
                    disabled={!visited}
                    className={`p-1.5 rounded-lg transition-colors ${
                      visited
                        ? 'text-white hover:bg-gray-700'
                        : 'text-gray-700 cursor-default'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  {visited && (
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-gray-800 text-gray-200 text-xs whitespace-nowrap opacity-0 group-hover/journal:opacity-100 transition-none">
                      Journal
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
