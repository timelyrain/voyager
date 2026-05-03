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

      {/* Mountain silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        style={{ height: 200 }}
      >
        <path
          d="M0,220 L0,150 L90,95 L170,135 L260,72 L340,115 L430,58 L510,98 L600,45 L680,88 L760,35 L840,78 L930,25 L1010,68 L1100,18 L1180,60 L1270,105 L1350,65 L1440,110 L1440,220 Z"
          fill="rgba(3,7,18,0.88)"
        />
        <path
          d="M0,220 L0,170 L130,128 L210,158 L330,108 L430,148 L550,90 L640,128 L760,96 L860,138 L980,78 L1070,118 L1190,88 L1300,128 L1390,108 L1440,140 L1440,220 Z"
          fill="rgba(4,9,20,0.96)"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 mb-10 text-center space-y-3">
        <div className="relative inline-flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--accent)', opacity: 0.5 }} />
          <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'var(--accent)', opacity: 0.3 }} />
          <span className="text-5xl relative z-10">🌍</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight theme-text">My Travel Log</h1>
        <p className="text-gray-400 text-base max-w-sm">
          Track the countries you have visited on an interactive world map.
        </p>
      </div>

      <div className="relative z-10">
        <AuthForm />
      </div>

      <footer className="absolute bottom-4 text-xs text-gray-600 z-10">
        Co-developed with Claude Code
      </footer>
    </div>
  )
}
