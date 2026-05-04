import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })
  try { const u = new URL(url); if (!['https:', 'http:'].includes(u.protocol)) throw new Error() } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const short = (await res.text()).trim()
      if (short.startsWith('https://')) return NextResponse.json({ url: short })
    }
  } catch (err) {
    console.error('[shorten] fetch failed:', err)
  }

  return NextResponse.json({ url })
}
