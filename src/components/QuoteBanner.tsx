'use client'

import { useState } from 'react'
import { BOURDAIN_QUOTES } from '@/data/quotes'

export default function QuoteBanner() {
  const [quote] = useState(() => BOURDAIN_QUOTES[Math.floor(Math.random() * BOURDAIN_QUOTES.length)])

  return (
    <div className="shrink-0 relative z-10 border-b border-gray-800/40 bg-black/10 px-4 py-1.5">
      <p className="text-[11px] italic text-gray-500 truncate">
        &ldquo;{quote.text}&rdquo;
        <span className="not-italic text-gray-600 ml-1">— {quote.author}</span>
      </p>
    </div>
  )
}
