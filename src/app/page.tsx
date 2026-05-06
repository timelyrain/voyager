import { pacifico } from '@/lib/fonts'
import AuthForm from '@/components/AuthForm'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Night sky gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #010409 0%, #040d24 18%, #0a1e4a 42%, #132344 55%, #0e1a38 70%, #0f172a 84%, #060f1c 100%)',
      }} />

      {/* Horizon glow — city lights at the edge of the world */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 160% 28% at 50% 100%, rgba(245,158,11,0.2) 0%, rgba(220,38,38,0.09) 30%, rgba(99,102,241,0.06) 55%, transparent 72%)',
      }} />

      {/* Left aurora */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 55% 85% at -8% 25%, rgba(99,102,241,0.14) 0%, transparent 60%)',
      }} />

      {/* Right aurora */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 55% 85% at 108% 20%, rgba(59,130,246,0.1) 0%, transparent 60%)',
      }} />

      {/* Stars */}
      <div className="absolute inset-0" style={{
        backgroundImage: [
          'radial-gradient(1px 1px at 8% 10%, rgba(255,255,255,0.9), transparent)',
          'radial-gradient(1.5px 1.5px at 22% 6%, rgba(255,255,255,0.7), transparent)',
          'radial-gradient(1px 1px at 38% 14%, rgba(200,220,255,0.8), transparent)',
          'radial-gradient(1px 1px at 53% 5%, rgba(255,255,255,0.6), transparent)',
          'radial-gradient(1.5px 1.5px at 68% 11%, rgba(255,255,255,0.85), transparent)',
          'radial-gradient(1px 1px at 79% 8%, rgba(200,220,255,0.7), transparent)',
          'radial-gradient(1px 1px at 91% 16%, rgba(255,255,255,0.5), transparent)',
          'radial-gradient(1px 1px at 14% 24%, rgba(255,255,255,0.45), transparent)',
          'radial-gradient(1px 1px at 46% 20%, rgba(255,255,255,0.55), transparent)',
          'radial-gradient(1.5px 1.5px at 62% 18%, rgba(200,220,255,0.5), transparent)',
          'radial-gradient(1px 1px at 85% 27%, rgba(255,255,255,0.4), transparent)',
          'radial-gradient(2px 2px at 31% 9%, rgba(255,255,255,0.35), transparent)',
          'radial-gradient(1px 1px at 73% 22%, rgba(255,255,255,0.45), transparent)',
        ].join(', '),
      }} />


      {/* Content */}
      <div className="relative z-10 mb-10 text-center space-y-3">
        <div className="relative inline-flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--accent)', opacity: 0.5 }} />
          <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'var(--accent)', opacity: 0.3 }} />
          <svg className="w-14 h-14 relative z-10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10.5" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.75"/>
            <path d="M12 3.5 L13.3 6.2 L10.7 6.2 Z" fill="white"/>
            {/* Major ticks: E, S, W */}
            <line x1="22.5" y1="12"   x2="20.8" y2="12"   stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
            <line x1="12"   y1="22.5" x2="12"   y2="20.8"  stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
            <line x1="1.5"  y1="12"   x2="3.2"  y2="12"   stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.75"/>
            {/* Intercardinal ticks: NE, SE, SW, NW */}
            <line x1="19.42" y1="4.58"  x2="18.51" y2="5.49"  stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            <line x1="19.42" y1="19.42" x2="18.51" y2="18.51" stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            <line x1="4.58"  y1="19.42" x2="5.49"  y2="18.51" stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            <line x1="4.58"  y1="4.58"  x2="5.49"  y2="5.49"  stroke="white" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
            {/* Minor ticks at 30° intervals */}
            <line x1="17.25" y1="2.91"  x2="16.75" y2="3.77"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="21.09" y1="6.75"  x2="20.23" y2="7.25"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="21.09" y1="17.25" x2="20.23" y2="16.75" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="17.25" y1="21.09" x2="16.75" y2="20.23" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="6.75"  y1="21.09" x2="7.25"  y2="20.23" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="2.91"  y1="17.25" x2="3.77"  y2="16.75" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="2.91"  y1="6.75"  x2="3.77"  y2="7.25"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <line x1="6.75"  y1="2.91"  x2="7.25"  y2="3.77"  stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            {/* Red direction indicator */}
            <g transform="rotate(90, 12, 12)">
              <path d="M12 4.8 L11 6.5 L13 6.5 Z" fill="#ef4444"/>
            </g>
            <circle cx="12" cy="12" r="1.5" fill="white"/>
            <circle cx="12" cy="12" r="0.6" fill="rgba(0,0,0,0.7)"/>
          </svg>
        </div>
        <h1 className={`${pacifico.className} text-4xl theme-text`}>Travelogue</h1>
        <p className="text-gray-400 text-base max-w-sm">
          Track the countries you have visited on an interactive world map.
        </p>
      </div>

      <div className="relative z-10">
        <AuthForm />
      </div>

      <footer className="absolute bottom-4 text-xs text-gray-600 z-10">
        a tribute to Anthony Bourdain
      </footer>
    </div>
  )
}
