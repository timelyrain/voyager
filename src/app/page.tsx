import AuthForm from '@/components/AuthForm'

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.018) 20px, rgba(255,255,255,0.018) 21px)',
      }}
    >
      <div className="mb-10 text-center space-y-3">
        <div className="relative inline-flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--accent)', opacity: 0.5 }} />
          <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'var(--accent)', opacity: 0.3 }} />
          <span className="text-5xl relative z-10">🌍</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.35em] theme-text uppercase">My Travel Log</p>
          <h1 className="text-4xl font-bold text-white tracking-tight">My Travel Log</h1>
        </div>
        <p className="text-gray-400 text-base max-w-sm">
          Track the countries you have visited on an interactive world map.
        </p>
      </div>
      <AuthForm />
    </div>
  )
}
