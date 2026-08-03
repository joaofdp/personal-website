// Deezer's public search needs no auth, so it works as an artwork fallback for
// albums Last.fm has no image for.

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

async function search(path: string, query: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search${path}?q=${encodeURIComponent(query)}&limit=5`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    return (await res.json())?.data ?? []
  } catch {
    return []
  }
}

/**
 * Looks up cover art for an album. Returns '' when there is no confident match —
 * callers treat that the same as a missing Last.fm image.
 */
export async function getDeezerAlbumImage(
  artist: string,
  album: string
): Promise<string> {
  if (!artist || !album) return ''

  const wantArtist = normalize(artist)
  const wantTitle = normalize(album)
  const byArtist = (r: any) => normalize(r.artist?.name ?? '') === wantArtist

  const albums = await search('/album', `artist:"${artist}" album:"${album}"`)
  // Only trust a result whose artist matches; the album title may carry extra
  // qualifiers ("(feat. …)", edition suffixes) so it is matched loosely.
  const album_ =
    albums.find((r: any) => byArtist(r) && normalize(r.title ?? '') === wantTitle) ??
    albums.find(byArtist)
  if (album_) return album_.cover_xl || album_.cover_big || ''

  // Scrobbles sometimes tag a single track with its own name as the album, which
  // leaves Last.fm holding an album page that no real release backs. Fall back to
  // the parent album of a same-named track.
  const tracks = await search('', `artist:"${artist}" track:"${album}"`)
  const track = tracks.find(
    (r: any) => byArtist(r) && normalize(r.title ?? '') === wantTitle
  )
  return track?.album?.cover_xl || track?.album?.cover_big || ''
}

/** Fills in any blank imageUrl from Deezer, leaving existing artwork untouched. */
export async function withFallbackArtwork<T extends { artist: string; name: string; imageUrl: string }>(
  albums: T[]
): Promise<T[]> {
  return Promise.all(
    albums.map(async (album) =>
      album.imageUrl
        ? album
        : { ...album, imageUrl: await getDeezerAlbumImage(album.artist, album.name) }
    )
  )
}
