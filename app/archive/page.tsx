import Link from 'next/link'
import { readContent } from '@/lib/content'
import { ArchiveEntry } from '@/lib/types'

export const revalidate = 0

export default async function ArchivePage() {
  const content = await readContent()

  // Sort descending (newest first)
  const entries: ArchiveEntry[] = [...content.archive].sort((a, b) =>
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
        {entries.length === 0 ? (
          <p className="empty-state">no past entries yet.</p>
        ) : (
          <div className="archive-list">
            {entries.map((entry, i) => (
              <div key={`${entry.date}-${i}`} className="archive-entry">
                <span className="archive-date">{entry.date}</span>
                <p className="archive-text">{entry.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
