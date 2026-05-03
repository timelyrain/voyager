'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UsernameModalProps {
  user: User
  onSaved: (username: string) => void
}

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

function deriveDefaults(user: User): { displayName: string; username: string } {
  const googleName: string = user.user_metadata?.full_name || user.user_metadata?.name || ''
  const emailPrefix = (user.email || '').split('@')[0]
  const displayName = googleName || emailPrefix
  const username = toSlug(googleName || emailPrefix)
  return { displayName, username }
}

export default function UsernameModal({ user, onSaved }: UsernameModalProps) {
  const defaults = deriveDefaults(user)
  const [displayName, setDisplayName] = useState(defaults.displayName)
  const [username, setUsername] = useState(defaults.username)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username)

  async function handleSave() {
    if (!isValid) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      username,
      display_name: displayName.trim() || username,
    })
    if (error) {
      setError(error.code === '23505' ? 'That username is already taken — try a different one.' : error.message)
      setLoading(false)
    } else {
      onSaved(username)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Get your shareable link</h2>
          <p className="text-sm text-gray-400 mt-1">
            We filled this in from your account — edit if you like, then confirm.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-700"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Your URL</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="pl-3 text-sm text-gray-500 shrink-0">/u/</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-1 py-2.5 bg-transparent text-white text-sm focus:outline-none min-w-0"
              />
            </div>
            {!isValid && username.length > 0 && (
              <p className="text-xs text-red-400 mt-1">Min 3 characters, letters, numbers and hyphens only.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid || loading}
          className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40"
        >
          {loading ? 'Saving…' : 'Confirm & copy link'}
        </button>
      </div>
    </div>
  )
}
