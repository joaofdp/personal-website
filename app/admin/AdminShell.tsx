'use client'

import { useState, useEffect, useTransition } from 'react'
import { verifyPassword, updateCurrently, saveAnnotation, takeSnapshot } from './actions'
import type { LastFmAlbum, LetterboxdFilm, ContentSchema } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────

function albumKey(artist: string, album: string): string {
  return `${artist.toLowerCase()}::${album.toLowerCase()}`
}

function filmKey(guid: string): string {
  return guid
}

// ─── Login form ───────────────────────────────────────────

function LoginForm({ onAuth }: { onAuth: (pw: string) => void }) {
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await verifyPassword(fd)
      if (res.ok) {
        onAuth(fd.get('password') as string)
      } else {
        setError('wrong password.')
      }
    })
  }

  return (
    <div className="admin-login">
      <h1>admin</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="password">password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            autoFocus
            required
          />
        </div>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'checking...' : 'enter'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  )
}

// ─── Currently form ───────────────────────────────────────

function CurrentlyForm({
  password,
  initialText,
}: {
  password: string
  initialText: string
}) {
  const [text, setText] = useState(initialText)
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('saving')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateCurrently(fd)
      if (res.ok) {
        setStatus('ok')
      } else {
        setStatus('err')
        setErrMsg(res.error ?? 'unknown error')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="password" value={password} />
      <div className="form-group">
        <label className="form-label" htmlFor="currently-text">currently</label>
        <textarea
          id="currently-text"
          name="text"
          className="form-textarea"
          value={text}
          onChange={(e) => { setText(e.target.value); setStatus('idle') }}
          required
        />
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'saving...' : 'save & archive'}
      </button>
      {status === 'ok' && <p className="success-msg">saved. previous entry archived.</p>}
      {status === 'err' && <p className="error-msg">{errMsg}</p>}
    </form>
  )
}

// ─── Snapshot section ─────────────────────────────────────

function SnapshotSection({ password }: { password: string }) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await takeSnapshot(fd)
      if (res.ok) {
        setStatus('ok')
      } else {
        setStatus('err')
        setErrMsg(res.error ?? 'unknown error')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="password" value={password} />
      <button type="submit" className="btn btn-snapshot" disabled={pending}>
        {pending ? 'capturing...' : status === 'ok' ? 'snapshot saved' : 'take snapshot'}
      </button>
      <p className="snapshot-hint">
        captures current state — listening, watching, annotations, and currently text.
      </p>
      {status === 'err' && <p className="error-msg">{errMsg}</p>}
    </form>
  )
}

// ─── Annotation form ──────────────────────────────────────

function AnnotationInput({
  password,
  type,
  entryKey,
  initialValue,
}: {
  password: string
  type: 'listening' | 'watching'
  entryKey: string
  initialValue: string
}) {
  const [value, setValue] = useState(initialValue)
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await saveAnnotation(fd)
      if (res.ok) {
        setStatus('ok')
      } else {
        setStatus('err')
        setErrMsg(res.error ?? 'unknown error')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="annotation-row">
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="key" value={entryKey} />
      <input
        name="annotation"
        type="text"
        className="form-input"
        placeholder="add a note..."
        value={value}
        onChange={(e) => { setValue(e.target.value); setStatus('idle') }}
      />
      <button type="submit" className="btn btn-small" disabled={pending}>
        {status === 'ok' ? '✓' : pending ? '...' : 'save'}
      </button>
      {status === 'err' && <span className="error-msg" title={errMsg}>err: {errMsg}</span>}
    </form>
  )
}

// ─── Dashboard ────────────────────────────────────────────

function Dashboard({
  password,
  content,
}: {
  password: string
  content: ContentSchema
}) {
  const [albums, setAlbums] = useState<LastFmAlbum[]>([])
  const [films, setFilms] = useState<LetterboxdFilm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/lastfm').then((r) => r.ok ? r.json() : []),
      fetch('/api/letterboxd').then((r) => r.ok ? r.json() : []),
    ]).then(([a, f]) => {
      setAlbums(a)
      setFilms(f)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Snapshot */}
      <div className="admin-section admin-section-snapshot">
        <h2>weekly snapshot</h2>
        <SnapshotSection password={password} />
      </div>

      {/* Currently */}
      <div className="admin-section">
        <h2>currently</h2>
        <CurrentlyForm
          password={password}
          initialText={content.currently.text}
        />
      </div>

      {/* Listening annotations */}
      <div className="admin-section">
        <h2>listening — annotations</h2>
        {loading ? (
          <p className="empty-state">loading...</p>
        ) : albums.length === 0 ? (
          <p className="empty-state">no Last.fm data. check your env vars.</p>
        ) : (
          <div>
            {albums.map((album) => {
              const key = albumKey(album.artist, album.name)
              return (
                <div key={key} className="admin-media-item">
                  {album.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.imageUrl}
                      alt={album.name}
                      className="admin-media-cover"
                    />
                  ) : (
                    <div className="admin-media-cover" style={{ background: 'var(--border)' }} />
                  )}
                  <div className="admin-media-fields">
                    <span className="admin-media-title">{album.name}</span>
                    <span className="admin-media-sub">{album.artist} · {album.playcount} plays</span>
                    <AnnotationInput
                      password={password}
                      type="listening"
                      entryKey={key}
                      initialValue={content.annotations.listening[key] ?? ''}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Watching annotations */}
      <div className="admin-section">
        <h2>watching — annotations</h2>
        {loading ? (
          <p className="empty-state">loading...</p>
        ) : films.length === 0 ? (
          <p className="empty-state">no Letterboxd data. check your env vars.</p>
        ) : (
          <div>
            {films.map((film) => {
              const key = filmKey(film.guid)
              return (
                <div key={key} className="admin-media-item">
                  {film.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={film.posterUrl}
                      alt={film.title}
                      className="admin-media-cover"
                    />
                  ) : (
                    <div className="admin-media-cover" style={{ background: 'var(--border)' }} />
                  )}
                  <div className="admin-media-fields">
                    <span className="admin-media-title">{film.title}</span>
                    {film.rating && (
                      <span className="admin-media-sub">{film.rating}</span>
                    )}
                    <AnnotationInput
                      password={password}
                      type="watching"
                      entryKey={key}
                      initialValue={content.annotations.watching[key] ?? ''}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────

export default function AdminShell({ content }: { content: ContentSchema }) {
  const [password, setPassword] = useState<string | null>(null)

  if (!password) {
    return <LoginForm onAuth={setPassword} />
  }

  return <Dashboard password={password} content={content} />
}
