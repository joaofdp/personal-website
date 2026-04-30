import { readContent, writeContent, todayString } from './content'
import { getTopAlbums, albumKey } from './lastfm'
import { getRecentFilms, filmKey } from './letterboxd'
import type { Snapshot } from './types'

export interface CreateSnapshotResult {
  ok: boolean
  skipped?: boolean
  reason?: string
  snapshot?: Snapshot
}

/**
 * Captures a snapshot of currently / listening / watching data and pushes it
 * onto content.snapshots. If a snapshot for today already exists, this is a
 * no-op (idempotent — safe for cron + manual runs on the same day).
 */
export async function createSnapshot(): Promise<CreateSnapshotResult> {
  const [content, albums, films] = await Promise.all([
    readContent(),
    getTopAlbums(),
    getRecentFilms(),
  ])

  const date = todayString()

  if (content.snapshots.some((s) => s.date === date)) {
    return { ok: true, skipped: true, reason: 'snapshot for today already exists' }
  }

  const snapshot: Snapshot = {
    date,
    currently: content.currently.text,
    listening: albums.map((album) => {
      const key = albumKey(album.artist, album.name)
      const annotation = content.annotations.listening[key]
      return {
        name: album.name,
        artist: album.artist,
        playcount: album.playcount,
        url: album.url,
        imageUrl: album.imageUrl,
        ...(annotation ? { annotation } : {}),
      }
    }),
    watching: films.map((film) => {
      const key = filmKey(film.guid)
      const annotation = content.annotations.watching[key]
      return {
        title: film.title,
        link: film.link,
        posterUrl: film.posterUrl,
        ...(film.rating ? { rating: film.rating } : {}),
        ...(annotation ? { annotation } : {}),
      }
    }),
  }

  content.snapshots.push(snapshot)
  await writeContent(content)

  return { ok: true, snapshot }
}
