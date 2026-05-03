'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  { text: "Be a traveler, not a tourist.", author: "Anthony Bourdain" },
  { text: "Travel changes you. As you move through this life and this world, you change things slightly, you leave marks behind, however small. And in return, life — and travel — leaves marks on you.", author: "Anthony Bourdain" },
  { text: "Your body is not a temple, it's an amusement park. Enjoy the ride.", author: "Anthony Bourdain" },
  { text: "If I'm an advocate for anything, it's to move. As far as you can, as much as you can. Across the ocean, or simply across the river.", author: "Anthony Bourdain" },
  { text: "Without experimentation, a willingness to ask questions and try new things, we shall surely become static, repetitive, and moribund.", author: "Anthony Bourdain" },
  { text: "I'm a big believer in winging it.", author: "Anthony Bourdain" },
  { text: "Good food is very often, even most often, simple food.", author: "Anthony Bourdain" },
  { text: "Skills can be taught. Character you either have or you don't have.", author: "Anthony Bourdain" },
  { text: "Do we really want to travel in hermetically sealed popemobiles through the rural provinces of France, Mexico, and the Far East, eating only in Hard Rock Cafes and McDonald's?", author: "Anthony Bourdain" },
  { text: "Maybe that's enlightenment enough: to know that there is no final resting place of the mind; no moment of smug clarity. Perhaps wisdom is realizing how small I am, and unwise, and how far I have yet to go.", author: "Anthony Bourdain" },
  { text: "I wanted adventures. I wanted to go up the Nung River to the heart of darkness in Cambodia.", author: "Anthony Bourdain" },
  { text: "I understand there's a guy inside me who wants to lay in bed, smoke weed all day, and watch cartoons and old movies. My whole life is a series of stratagems to avoid and outwit that guy.", author: "Anthony Bourdain" },
  { text: "Mise en place is the religion of all good line cooks.", author: "Anthony Bourdain" },
  { text: "The wilderness of the kitchen is ruled by a specific, often brutal hierarchy.", author: "Anthony Bourdain" },
  { text: "Low plastic stool, good food, cold beer.", author: "Barack Obama" },
  { text: "He was the brightest light in every room he entered.", author: "Eric Ripert" },
  { text: "He brought the world into our living rooms and inspired us to explore cultures and places with an open mind.", author: "CNN" },
]

export default function QuoteBanner() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % QUOTES.length)
        setVisible(true)
      }, 400)
    }, 9000)
    return () => clearInterval(interval)
  }, [])

  const q = QUOTES[idx]

  return (
    <div className="shrink-0 relative z-10 border-b border-gray-800/40 bg-black/10 px-4 py-1.5">
      <p
        className="text-[11px] italic text-gray-500 truncate transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        &ldquo;{q.text}&rdquo;
        <span className="not-italic text-gray-600 ml-1">— {q.author}</span>
      </p>
    </div>
  )
}
