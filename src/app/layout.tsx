import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Travel Log — Track countries you have visited',
  description: 'Interactive world map to track the countries you have visited.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Travel Log',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${geist.className} h-full bg-[#0f172a] antialiased`}>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
