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

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: ThemeId }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme ?? DEFAULT_THEME)

  useEffect(() => {
    if (initialTheme) {
      applyTheme(initialTheme)
      return
    }
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
