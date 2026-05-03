'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type ThemeId, DEFAULT_THEME, THEMES } from '@/lib/themes'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as ThemeId) || DEFAULT_THEME
    const valid = THEMES[saved] ? saved : DEFAULT_THEME
    applyTheme(valid)
    setThemeState(valid)
  }, [])

  function setTheme(id: ThemeId) {
    const valid = THEMES[id] ? id : DEFAULT_THEME
    applyTheme(valid)
    setThemeState(valid)
    localStorage.setItem('theme', valid)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
}

export const useTheme = () => useContext(ThemeContext)
