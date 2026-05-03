import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function fetchWorldBankRankings() {
  // mrv=3 fetches last 3 years so we always get the latest available even if current year lags
  const url = 'https://api.worldbank.org/v2/country/all/indicator/ST.INT.ARVL?format=json&per_page=500&mrv=3'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`World Bank API returned ${res.status}`)
  const [, data] = await res.json()

  // Keep only the most recent non-null value per country (World Bank uses ISO alpha-2 in country.id)
  const latest = new Map()
  for (const entry of (data || [])) {
    if (!entry.value || !entry.country?.id) continue
    const code = entry.country.id
    const existing = latest.get(code)
    if (!existing || entry.date > existing.date) {
      latest.set(code, { value: entry.value, date: entry.date })
    }
  }

  // Sort descending by arrivals → rank 1 = most visited
  const ranked = [...latest.entries()]
    .sort(([, a], [, b]) => b.value - a.value)
    .map(([code], i) => [code, i + 1])

  return new Map(ranked)
}

async function main() {
  console.log('Fetching World Bank international tourist arrivals...')
  const rankings = await fetchWorldBankRankings()
  console.log(`Received data for ${rankings.size} countries`)

  const filePath = join(__dirname, '../src/data/countries.ts')
  let source = readFileSync(filePath, 'utf-8')
  const original = source

  let updated = 0
  for (const [code, rank] of rankings) {
    // Matches: { code: 'XX', ... rank: 123 }  (single-line entry)
    const re = new RegExp(`(code:\\s*'${code}'[^}]+rank:\\s*)\\d+`, 'g')
    const next = source.replace(re, `$1${rank}`)
    if (next !== source) {
      source = next
      updated++
    }
  }

  if (source === original) {
    console.log('Rankings unchanged — no file update needed.')
    return
  }

  writeFileSync(filePath, source, 'utf-8')
  console.log(`Updated ${updated} country rankings in countries.ts`)
}

main().catch((err) => { console.error(err); process.exit(1) })
