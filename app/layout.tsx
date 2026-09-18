import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/seo'
import './globals.css'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    noimageindex: true,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={ibmPlexMono.className}>
      <body>{children}</body>
    </html>
  )
}
