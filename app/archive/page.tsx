import Link from 'next/link'
import { readContent } from '@/lib/content'
import { withFallbackArtwork } from '@/lib/deezer'
import type { Snapshot } from '@/lib/types'

export const revalidate = 0

export default async function ArchivePage() {
  const content = await readContent()

  const sorted: Snapshot[] = [...(content.snapshots ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  )

  // Older snapshots were stored before the artwork fallback existed, so resolve
  // any blanks on read rather than rewriting the saved data.
  const snapshots: Snapshot[] = await Promise.all(
    sorted.map(async (snap) => ({
      ...snap,
      listening: await withFallbackArtwork(snap.listening),
    }))
  )

  return (
    <main className="page">
      <header className="site-header">
        <p className="site-name">João Passarelli</p>
        <nav className="site-nav">
          <Link href="/">currents</Link>
          <Link href="/archive" className="active">archive</Link>
        </nav>
      </header>

      <section className="section">
        <p className="section-label">archive</p>
        {snapshots.length === 0 ? (
          <p className="empty-state">no snapshots yet.</p>
        ) : (
          <div className="snapshot-list">
            {snapshots.map((snap, idx) => {
              // Only show films new to this snapshot (not in the previous one)
              const prevSnap = snapshots[idx + 1] // next in array = previous chronologically
              const prevFilmLinks = prevSnap
                ? new Set(prevSnap.watching.map((f) => f.link))
                : new Set<string>()
              const newFilms = snap.watching.filter((f) => !prevFilmLinks.has(f.link))

              return (
                <div key={snap.date} className="snapshot">
                  <p className="snapshot-date">{snap.date}</p>

                  {snap.currently && (
                    <p className="snapshot-currently">{snap.currently}</p>
                  )}

                  {snap.listening.length > 0 && (
                    <>
                      <hr className="snap-divider" />
                      <div className="snap-covers">
                        {snap.listening.map((album, i) => (
                          <a key={`${snap.date}-l-${i}`} href={album.url} target="_blank" rel="noopener noreferrer">
                            <div
                              className="snap-cover"
                              style={album.imageUrl ? { backgroundImage: `url(${album.imageUrl})` } : undefined}
                            />
                          </a>
                        ))}
                      </div>
                    </>
                  )}

                  {newFilms.length > 0 && (
                    <>
                      <hr className="snap-divider" />
                      <div className="snap-covers">
                        {newFilms.map((film, i) => (
                          <a key={`${snap.date}-w-${i}`} href={film.link} target="_blank" rel="noopener noreferrer">
                            <div
                              className="snap-cover snap-film-cover"
                              style={film.posterUrl ? { backgroundImage: `url(${film.posterUrl})` } : undefined}
                            />
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
