import { readContent } from '@/lib/content'
import AdminShell from './AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const content = await readContent()

  return (
    <main className="page">
      <header className="site-header">
        <p className="site-name">João Passarelli</p>
        <nav className="site-nav">
          <a href="/">currents</a>
          <a href="/archive">archive</a>
        </nav>
      </header>

      <AdminShell content={content} />
    </main>
  )
}
