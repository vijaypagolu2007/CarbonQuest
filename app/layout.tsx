import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/firebase/AuthContext'
import { AuthCookieSync } from '@/components/auth/AuthCookieSync'
import { SkipNav } from '@/components/SkipNav'

export const metadata: Metadata = {
  title: 'CarbonQuest — Make Carbon Visible',
  description: 'Track your carbon footprint, grow a living virtual 3D world, and compete with friends to reduce your environmental impact. Powered by Gemini AI.',
  keywords: ['carbon footprint', 'sustainability', 'gamification', 'climate', 'eco tracker', 'AI coach'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CarbonQuest',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'CarbonQuest — Make Carbon Visible',
    description: 'Gamified carbon footprint tracker with a living 3D world powered by Gemini AI.',
    type: 'website',
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
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full antialiased">
        <SkipNav />
        <AuthProvider>
          <AuthCookieSync />
          <div id="main-content">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
