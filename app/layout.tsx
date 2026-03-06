import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'joão passarelli',
  description: 'designer. founder of weird fishes atelier.',
  robots: {
    index: true,
    noimageindex: true,
  },
  openGraph: {
    title: 'joão passarelli',
    description: 'designer. founder of weird fishes atelier.',
    url: 'https://joaopassarelli.com',
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
