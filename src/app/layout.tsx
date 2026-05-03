import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voyager — Track countries you have visited',
  description: 'Interactive world map to track the countries you have visited.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} h-full bg-[#0f172a] antialiased`}>
        {children}
      </body>
    </html>
  )
}
