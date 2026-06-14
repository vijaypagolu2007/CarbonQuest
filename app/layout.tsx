import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/firebase/AuthContext'
import { AuthCookieSync } from '@/components/auth/AuthCookieSync'

export const metadata: Metadata = {
  title: 'CarbonQuest — Make Carbon Visible',
  description: 'Track your carbon footprint, grow a living virtual world, and compete with friends to reduce your environmental impact.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CarbonQuest',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#050d0a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full antialiased">
        <AuthProvider>
          <AuthCookieSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
