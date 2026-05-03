import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .eq('share_key', key)
    .single()

  const name = profile?.display_name || 'A traveller'

  let visitedCount = 0
  if (profile?.user_id) {
    const { count } = await supabase
      .from('visited_countries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.user_id)
    visitedCount = count ?? 0
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Radial glow accents */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at 25% 60%, rgba(220,38,38,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 40%, rgba(99,102,241,0.12) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* Globe */}
        <div style={{ fontSize: 110, lineHeight: 1, marginBottom: 28, display: 'flex' }}>
          🌍
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-1px',
            marginBottom: 12,
            display: 'flex',
          }}
        >
          {name}&apos;s Travel Map
        </div>

        {/* Country count */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: '#dc2626',
            marginBottom: 36,
            display: 'flex',
          }}
        >
          {visitedCount} {visitedCount === 1 ? 'country' : 'countries'} visited
        </div>

        {/* Divider dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: '#334155',
              }}
            />
          ))}
        </div>

        {/* Brand */}
        <div style={{ fontSize: 22, color: '#475569', letterSpacing: '0.08em', display: 'flex' }}>
          MY TRAVEL LOG
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
