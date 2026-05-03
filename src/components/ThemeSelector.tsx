'use client'

import { useEffect, useRef, useState } from 'react'
import { THEMES, THEME_IDS, type ThemeId } from '@/lib/themes'
import { useTheme } from '@/context/ThemeContext'

interface Props {
  onSave?: (theme: ThemeId) => void
}

export default function ThemeSelector({ onSave }: Props) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSelect(id: ThemeId) {
    setTheme(id)
    setOpen(false)
    onSave?.(id)
  }

  const current = THEMES[theme]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-medium"
        title="Change theme"
      >
        <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: current.accentHex }} />
        <span className="hidden sm:inline text-gray-300">Theme</span>
        <span className="text-gray-400 text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          {THEME_IDS.map((id) => {
            const t = THEMES[id]
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-700 transition-colors ${
                  theme === id ? 'bg-gray-700/60' : ''
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: t.accentHex }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{t.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{t.tagline}</div>
                </div>
                {theme === id && (
                  <span className="ml-auto text-xs shrink-0" style={{ color: t.accentHex }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
