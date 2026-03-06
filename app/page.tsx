import Link from 'next/link'
import { readContent } from '@/lib/content'
import { getTopAlbums, albumKey } from '@/lib/lastfm'
import { getRecentFilms, filmKey } from '@/lib/letterboxd'
import { getSpotifyAlbumUrl } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [content, albums, films] = await Promise.all([
    readContent(),
    getTopAlbums(),
    getRecentFilms(),
  ])

  const spotifyUrls = await Promise.all(
    albums.map((a) => getSpotifyAlbumUrl(a.artist, a.name))
  )

  const { currently, annotations } = content

  return (
    <main className="page">
      <header className="site-header">
        <p className="site-name">João Passarelli</p>
        <nav className="site-nav">
          <Link href="/" className="active">currents</Link>
          <Link href="/archive">archive</Link>
        </nav>
      </header>

      {/* Currently */}
      <section className="section">
        <p className="section-label">currently</p>
        {currently.text ? (
          <>
            <p className="currently-text">{currently.text}</p>
            <p className="currently-date">{currently.updatedAt}</p>
          </>
        ) : (
          <p className="empty-state">nothing here yet.</p>
        )}
      </section>

      {/* Listening */}
      <section className="section">
        <p className="section-label">listening</p>
        {albums.length === 0 ? (
          <p className="empty-state">no data.</p>
        ) : (
          <div className="media-list">
            {albums.map((album, i) => {
              const key = albumKey(album.artist, album.name)
              const annotation = annotations.listening[key]
              const albumUrl = spotifyUrls[i] ?? album.url
              return (
                <div key={key} className="media-item">
                  <div
                    className="media-cover"
                    style={album.imageUrl ? { backgroundImage: `url(${album.imageUrl})` } : undefined}
                  />
                  <div className="media-info">
                    <a
                      href={albumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="media-title"
                    >
                      {album.name}
                    </a>
                    <span className="media-sub">{album.artist}</span>
                    <span className="media-sub">{album.playcount} plays</span>
                    {annotation && (
                      <p className="media-annotation">{annotation}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Watching */}
      <section className="section">
        <p className="section-label">watching</p>
        {films.length === 0 ? (
          <p className="empty-state">no data.</p>
        ) : (
          <div className="media-list">
            {films.map((film) => {
              const key = filmKey(film.guid)
              const annotation = annotations.watching[key]
              return (
                <div key={key} className="media-item">
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
                    {annotation && (
                      <p className="media-annotation">{annotation}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
