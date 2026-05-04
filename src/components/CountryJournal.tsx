'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES } from '@/data/countries'
import { COUNTRY_CITIES } from '@/data/cities'
import { OFF_THE_MAP } from '@/components/StatsPanel'

const MAX_JOURNAL_CHARS = 2000

interface CountryJournalProps {
  countryCode: string
  userId: string
  onClose: () => void
}

function getFlagEmoji(code: string) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('')
}

const MAX_PHOTOS = 10

export default function CountryJournal({ countryCode, userId, onClose }: CountryJournalProps) {
  const country = COUNTRIES.find(c => c.code === countryCode)
  const cities = COUNTRY_CITIES[countryCode] || []

  const [photos, setPhotos] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [journalText, setJournalText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('country_journals')
        .select('*')
        .eq('user_id', userId)
        .eq('country_code', countryCode)
        .single()
      if (data) {
        setPhotos(data.photo_urls || [])
        setSelectedCities(data.cities_visited || [])
        setJournalText(data.journal_text || '')
      }
      setLoading(false)
    }
    load()
  }, [userId, countryCode])

  function toggleCity(city: string) {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  async function handleFiles(files: FileList | null) {
    if (!files || uploading) return
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) return
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []
    let failed = 0
    for (const file of toUpload) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${countryCode}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('country-photos').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('country-photos').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      } else {
        failed++
        console.error('[handleFiles] upload failed:', error.message)
      }
    }
    setPhotos(prev => [...prev, ...newUrls])
    if (failed > 0) alert(`${failed} photo${failed > 1 ? 's' : ''} failed to upload. Please try again.`)
    setUploading(false)
  }

  async function removePhoto(url: string) {
    const supabase = createClient()
    const path = url.split('/country-photos/')[1]
    if (path) await supabase.storage.from('country-photos').remove([path])
    setPhotos(prev => prev.filter(p => p !== url))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('country_journals').upsert(
      {
        user_id: userId,
        country_code: countryCode,
        journal_text: journalText,
        cities_visited: selectedCities,
        photo_urls: photos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,country_code' }
    )
    setSaving(false)
    onClose()
  }

  if (!country) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full md:max-w-lg bg-gray-900 md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-700/60 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getFlagEmoji(countryCode)}</span>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">{country.name}</h2>
                <p className="text-xs text-gray-400">{country.continent}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">Loading…</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-5">

              {/* Cities */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Destinations visited</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCities.includes(city)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                  <button
                    onClick={() => toggleCity(OFF_THE_MAP)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCities.includes(OFF_THE_MAP)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ✦ Off the Map
                  </button>
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">Your moments</h3>
                  <span className="text-xs text-gray-500">{photos.length}/{MAX_PHOTOS}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {photos.map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={url} alt={`Photo from ${country.name}`} className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => removePhoto(url)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-400 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                          </svg>
                          <span className="text-[10px] text-gray-500">Add</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

              {/* Journal text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">Your story</h3>
                  <span className={`text-xs ${journalText.length > MAX_JOURNAL_CHARS * 0.9 ? 'text-amber-400' : 'text-gray-500'}`}>
                    {journalText.length}/{MAX_JOURNAL_CHARS}
                  </span>
                </div>
                <textarea
                  value={journalText}
                  onChange={e => setJournalText(e.target.value.slice(0, MAX_JOURNAL_CHARS))}
                  placeholder="Write about your experience…"
                  rows={5}
                  className="w-full px-3 py-2.5 bg-gray-800 text-white placeholder-gray-500 rounded-xl text-[16px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none border border-gray-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-4 py-3 border-t border-gray-700/60 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
