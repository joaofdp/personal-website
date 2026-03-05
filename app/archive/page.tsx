import Link from 'next/link'
import { readContent } from '@/lib/content'
import type { Snapshot } from '@/lib/types'

export const revalidate = 0

export default async function ArchivePage() {
  const content = await readContent()

  const snapshots: Snapshot[] = [...(content.snapshots ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date)
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
            {snapshots.map((snap) => (
              <div key={snap.date} className="snapshot">
                <p className="snapshot-date">{snap.date}</p>

                {snap.currently && (
                  <p className="snapshot-currently">{snap.currently}</p>
                )}

                {snap.listening.length > 0 && (
                  <div className="snapshot-block">
                    <p className="snapshot-block-label">listening</p>
                    <div className="media-list">
                      {snap.listening.map((album, i) => (
                        <div key={`${snap.date}-l-${i}`} className="media-item">
                          <div
                            className="media-cover"
                            style={album.imageUrl ? { backgroundImage: `url(${album.imageUrl})` } : undefined}
                          />
                          <div className="media-info">
                            <a
                              href={album.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="media-title"
                            >
                              {album.name}
                            </a>
                            <span className="media-sub">{album.artist}</span>
                            <span className="media-sub">{album.playcount} plays</span>
                            {album.annotation && (
                              <p className="media-annotation">{album.annotation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {snap.watching.length > 0 && (
                  <div className="snapshot-block">
                    <p className="snapshot-block-label">watching</p>
                    <div className="media-list">
                      {snap.watching.map((film, i) => (
                        <div key={`${snap.date}-w-${i}`} className="media-item">
                          <div
                            className="media-cover"
                            style={film.posterUrl ? { backgroundImage: `url(${film.posterUrl})` } : undefined}
                          />
                          <div className="media-info">
                            <a
                              href={film.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="media-title"
                            >
                              {film.title}
                            </a>
                            {film.rating && (
                              <span className="media-rating">{film.rating}</span>
                            )}
                            {film.annotation && (
                              <p className="media-annotation">{film.annotation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
