import type { Metadata } from 'next'
import { Geist_Mono, Outfit } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Spotilyze',
    template: '%s · Spotilyze',
  },
  description:
    'Your personal Spotify listening dashboard. Track plays, top artists, genres, and wrapped snapshots — self-hosted with SQLite.',
  keywords: ['Spotify', 'listening history', 'dashboard', 'wrapped', 'self-hosted', 'analytics'],
  authors: [{ name: 'Spotilyze' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Spotilyze',
    title: 'Spotilyze — Your Spotify listening dashboard',
    description:
      'Turn your Spotify history into a clean dashboard with charts, wrapped snapshots, and exports.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spotilyze — Your Spotify listening dashboard',
    description:
      'Turn your Spotify history into a clean dashboard with charts, wrapped snapshots, and exports.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} min-h-[100dvh] font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
