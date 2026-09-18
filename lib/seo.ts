import type { Metadata } from 'next'

export const SITE_URL = 'https://www.joaopassarelli.com'
export const SITE_TITLE = 'joão passarelli'
export const SITE_DESCRIPTION = 'designer. founder of weird fishes atelier.'

export function publicPageMetadata(path: '/' | '/archive'): Metadata {
  const url = new URL(path, SITE_URL).href

  return {
    alternates: { canonical: url },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url,
    },
  }
}

export const profileStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profile`,
  url: `${SITE_URL}/`,
  mainEntity: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'João Passarelli',
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    sameAs: [
      'https://github.com/joaofdp',
      'https://www.midjourney.com/@weirdfishes',
      'https://x.com/fishesareweird',
    ],
  },
}
