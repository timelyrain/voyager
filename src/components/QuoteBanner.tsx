'use client'

import { useEffect, useRef, useState } from 'react'
import { BOURDAIN_QUOTES } from '@/data/quotes'

const PAUSE_START  = 1500   // ms: hold before scrolling
const SCROLL_SPEED = 18     // px/s
const PAUSE_END    = 600    // ms: hold at end after scroll
const FADE_OUT     = 1800   // ms: slow fade to invisible
const WAIT         = 3000   // ms: invisible pause before restart
const FADE_IN      = 1000   // ms: fade back in

export default function QuoteBanner() {
  const [quote] = useState(() => BOURDAIN_QUOTES[Math.floor(Math.random() * BOURDAIN_QUOTES.length)])
  const textRef      = useRef<HTMLParagraphElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number>(0)

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return
    const diff = textRef.current.scrollWidth - containerRef.current.clientWidth
    const scrollPx = diff > 0 ? diff + 16 : 0
    if (scrollPx === 0) return

    const el = textRef.current
    const scrollDuration = (scrollPx / SCROLL_SPEED) * 1000

    type Phase = 'pause-start' | 'scroll' | 'pause-end' | 'fade-out' | 'wait' | 'fade-in'
    let phase: Phase = 'pause-start'
    let phaseStart = performance.now()

    function tick(now: number) {
      const elapsed = now - phaseStart

      switch (phase) {
        case 'pause-start':
          if (elapsed >= PAUSE_START) { phase = 'scroll'; phaseStart = now }
          break

        case 'scroll': {
          const t = Math.min(elapsed / scrollDuration, 1)
          el.style.transform = `translateX(${-scrollPx * t}px)`
          if (t >= 1) { phase = 'pause-end'; phaseStart = now }
          break
        }

        case 'pause-end':
          if (elapsed >= PAUSE_END) { phase = 'fade-out'; phaseStart = now }
          break

        case 'fade-out': {
          const t = Math.min(elapsed / FADE_OUT, 1)
          el.style.opacity = String(1 - t)
          if (t >= 1) {
            el.style.transform = 'translateX(0)'
            phase = 'wait'
            phaseStart = now
          }
          break
        }

        case 'wait':
          if (elapsed >= WAIT) { phase = 'fade-in'; phaseStart = now }
          break

        case 'fade-in': {
          const t = Math.min(elapsed / FADE_IN, 1)
          el.style.opacity = String(t)
          if (t >= 1) { phase = 'pause-start'; phaseStart = now }
          break
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      ref={containerRef}
      className="shrink-0 relative z-10 overflow-hidden"
    >
      <p
        ref={textRef}
        className="text-[11px] italic text-gray-500 whitespace-nowrap px-4 py-1.5"
      >
        &ldquo;{quote.text}&rdquo;
        <span className="not-italic text-gray-600 ml-1">— {quote.author}</span>
      </p>

    </div>
  )
}
