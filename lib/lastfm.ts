import { LastFmAlbum } from './types'

export async function getTopAlbums(): Promise<LastFmAlbum[]> {
  const apiKey = process.env.LASTFM_API_KEY
  const username = process.env.LASTFM_USERNAME

  if (!apiKey || !username) return []

  const url = new URL('https://ws.audioscrobbler.com/2.0/')
  url.searchParams.set('method', 'user.gettopalbums')
  url.searchParams.set('user', username)
  url.searchParams.set('period', '7day')
  url.searchParams.set('limit', '6')
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('format', 'json')

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []

    const data = await res.json()
    const albums = data?.topalbums?.album ?? []

    return albums.map((a: any): LastFmAlbum => {
      // Last.fm returns images as [{#text: url, size: 'small'|'medium'|'large'|'extralarge'|'mega'}]
      const largeImg =
        a.image?.find((i: any) => i.size === 'extralarge')?.['#text'] ||
        a.image?.find((i: any) => i.size === 'large')?.['#text'] ||
        ''

      return {
        name: a.name,
        artist: a.artist?.name ?? '',
        playcount: a.playcount ?? '0',
        url: a.url ?? '',
        imageUrl: largeImg,
      }
    })
  } catch {
    return []
  }
}

export function albumKey(artist: string, album: string): string {
  return `${artist.toLowerCase()}::${album.toLowerCase()}`
}
