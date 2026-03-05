import { LetterboxdFilm } from './types'

function extractPosterUrl(description: string): string {
  const match = description.match(/<img[^>]+src="([^"]+)"/)
  return match?.[1] ?? ''
}

function extractRating(description: string): string {
  // Letterboxd encodes ratings as star characters in the description
  const match = description.match(/Rated:\s*([\u2605\u2606\u00BD★☆½]+)/i)
  return match?.[1] ?? ''
}

export async function getRecentFilms(): Promise<LetterboxdFilm[]> {
  const username = process.env.LETTERBOXD_USERNAME
  if (!username) return []

  const url = `https://letterboxd.com/${username}/rss/`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const { XMLParser } = await import('fast-xml-parser')
    const parser = new XMLParser({
      ignoreAttributes: false,
      cdataPropName: '__cdata',
    })
    const parsed = parser.parse(xml)
    const items: any[] = parsed?.rss?.channel?.item ?? []

    return items.slice(0, 6).map((item: any): LetterboxdFilm => {
      const description: string =
        item.description?.__cdata ?? item.description ?? ''

      return {
        title: item['letterboxd:filmTitle'] ?? item.title ?? '',
        link: item.link ?? '',
        guid: item.guid?.['#text'] ?? item.guid ?? '',
        pubDate: item.pubDate ?? '',
        posterUrl: extractPosterUrl(description),
        rating: item['letterboxd:memberRating']
          ? starRating(parseFloat(item['letterboxd:memberRating']))
          : extractRating(description),
      }
    })
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

function starRating(rating: number): string {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return '★'.repeat(full) + (half ? '½' : '')
}

export function filmKey(guid: string): string {
  return guid
}
