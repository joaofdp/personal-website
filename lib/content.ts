import { ContentSchema } from './types'

const BLOB_NAME = 'content.json'

const DEFAULT_CONTENT: ContentSchema = {
  currently: { text: '', updatedAt: new Date().toISOString().split('T')[0] },
  archive: [],
  snapshots: [],
  annotations: { listening: {}, watching: {} },
}

// Local dev fallback (when BLOB_READ_WRITE_TOKEN is not set)
async function readLocal(): Promise<ContentSchema> {
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  try {
    const raw = await readFile(join(process.cwd(), 'content.json'), 'utf-8')
    const parsed = JSON.parse(raw) as ContentSchema
    if (!parsed.snapshots) parsed.snapshots = []
    return parsed
  } catch {
    return DEFAULT_CONTENT
  }
}

async function writeLocal(data: ContentSchema): Promise<void> {
  const { writeFile, rename } = await import('fs/promises')
  const { join } = await import('path')
  const tmp = join(process.cwd(), 'content.tmp.json')
  const dest = join(process.cwd(), 'content.json')
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
  await rename(tmp, dest)
}

export async function readContent(): Promise<ContentSchema> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return readLocal()
  }

  const { unstable_noStore: noStore } = await import('next/cache')
  noStore()

  const { get } = await import('@vercel/blob')

  try {
    // Fetch directly from origin, bypassing CDN cache
    const result = await get(BLOB_NAME, { access: 'private', useCache: false })
    if (!result || !result.stream) return DEFAULT_CONTENT
    const text = await new Response(result.stream).text()
    const parsed = JSON.parse(text) as ContentSchema
    if (!parsed.snapshots) parsed.snapshots = []
    return parsed
  } catch {
    return DEFAULT_CONTENT
  }
}

export async function writeContent(data: ContentSchema): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return writeLocal(data)
  }

  const { put } = await import('@vercel/blob')
  const serialized = JSON.stringify(data, null, 2)

  await put(BLOB_NAME, serialized, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export function todayString(): string {
  // Returns YYYY-MM-DD. Adjust TZ as needed.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.SITE_TIMEZONE ?? 'UTC',
  }).format(new Date())
}
