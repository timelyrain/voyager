export type ThemeId = 'passport' | 'vintage' | 'airline' | 'journal' | 'celestial'

export interface ThemeConfig {
  id: ThemeId
  name: string
  tagline: string
  accentHex: string
  visitedColor: string
  visitedHover: string
  visitedPressed: string
  bucketColor: string
  bucketHover: string
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  passport: {
    id: 'passport',
    name: 'Passport & Stamps',
    tagline: 'Burgundy red, stamp ink',
    accentHex: '#dc2626',
    visitedColor: '#dc2626',
    visitedHover: '#ef4444',
    visitedPressed: '#b91c1c',
    bucketColor: '#eab308',
    bucketHover: '#fde047',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage Travel Poster',
    tagline: 'Amber terracotta, ocean teal',
    accentHex: '#d97706',
    visitedColor: '#d97706',
    visitedHover: '#f59e0b',
    visitedPressed: '#b45309',
    bucketColor: '#0d9488',
    bucketHover: '#14b8a6',
  },
  airline: {
    id: 'airline',
    name: 'Cabin Crew / Airline',
    tagline: 'Gold, premium midnight blue',
    accentHex: '#ca8a04',
    visitedColor: '#ca8a04',
    visitedHover: '#eab308',
    visitedPressed: '#a16207',
    bucketColor: '#38bdf8',
    bucketHover: '#7dd3fc',
  },
  journal: {
    id: 'journal',
    name: "Explorer's Field Journal",
    tagline: 'Olive green, amber lantern',
    accentHex: '#65a30d',
    visitedColor: '#65a30d',
    visitedHover: '#84cc16',
    visitedPressed: '#4d7c0f',
    bucketColor: '#d97706',
    bucketHover: '#f59e0b',
  },
  celestial: {
    id: 'celestial',
    name: 'Night Sky / Celestial',
    tagline: 'Violet aurora, cyan glow',
    accentHex: '#7c3aed',
    visitedColor: '#7c3aed',
    visitedHover: '#8b5cf6',
    visitedPressed: '#6d28d9',
    bucketColor: '#06b6d4',
    bucketHover: '#22d3ee',
  },
}

export const THEME_IDS = Object.keys(THEMES) as ThemeId[]
export const DEFAULT_THEME: ThemeId = 'passport'
