import AuthForm from '@/components/AuthForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center space-y-3">
        <div className="text-6xl">🌍</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Voyager</h1>
        <p className="text-gray-400 text-lg max-w-sm">
          Track the countries you have visited on an interactive world map.
        </p>
      </div>
      <AuthForm />
    </div>
  )
}
