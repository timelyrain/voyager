'use client'

import { useState, useEffect, useRef } from 'react'
import { BOURDAIN_QUOTES } from '@/data/quotes'

export default function QuoteBanner() {
  const [quote] = useState(() => BOURDAIN_QUOTES[Math.floor(Math.random() * BOURDAIN_QUOTES.length)])
  const textRef = useRef<HTMLParagraphElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPx, setScrollPx] = useState(0)

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return
    const diff = textRef.current.scrollWidth - containerRef.current.clientWidth
    if (diff > 0) setScrollPx(diff + 16) // +16 for right padding
  }, [])

  // ~18px/s for a slow, comfortable read; min 8s so short overflows don't feel rushed
  const duration = scrollPx > 0 ? Math.max(8, Math.round(scrollPx / 18)) : 0

  return (
    <div
      ref={containerRef}
      className="shrink-0 relative z-10 border-b border-gray-800/40 bg-black/10 overflow-hidden"
    >
      <p
        ref={textRef}
        className="text-[11px] italic text-gray-500 whitespace-nowrap px-4 py-1.5"
        style={scrollPx > 0 ? {
          '--scroll-px': `-${scrollPx}px`,
          animation: `scroll-quote ${duration}s ease-in-out 1.5s infinite`,
        } as React.CSSProperties : {}}
      >
        &ldquo;{quote.text}&rdquo;
        <span className="not-italic text-gray-600 ml-1">— {quote.author}</span>
      </p>

      {/* Right-edge fade — hints at more text and softens the crop */}
      <div className="absolute inset-y-0 right-0 w-10 pointer-events-none bg-gradient-to-l from-[#07101f] to-transparent" />
    </div>
  )
}
