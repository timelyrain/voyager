import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Travelogue — Track countries you have visited',
  description: 'Interactive world map to track the countries you have visited.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Travelogue',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
      </head>
      <body className={`${geist.className} h-full bg-[#0f172a] antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
