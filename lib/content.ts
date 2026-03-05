import { ContentSchema } from './types'

const BLOB_NAME = 'content.json'

const DEFAULT_CONTENT: ContentSchema = {
  currently: { text: '', updatedAt: new Date().toISOString().split('T')[0] },
  archive: [],
  annotations: { listening: {}, watching: {} },
}

// Local dev fallback (when BLOB_READ_WRITE_TOKEN is not set)
async function readLocal(): Promise<ContentSchema> {
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  try {
    const raw = await readFile(join(process.cwd(), 'content.json'), 'utf-8')
    return JSON.parse(raw) as ContentSchema
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

  const { list, head } = await import('@vercel/blob')

  try {
    // Find the blob by prefix
    const { blobs } = await list({ prefix: BLOB_NAME })
    const blob = blobs.find((b) => b.pathname === BLOB_NAME)
    if (!blob) return DEFAULT_CONTENT

    // Fetch the actual content
    const res = await fetch(blob.url, { cache: 'no-store' })
    if (!res.ok) return DEFAULT_CONTENT
    return (await res.json()) as ContentSchema
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
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  })
}

export function todayString(): string {
  // Returns YYYY-MM-DD. Adjust TZ as needed.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.SITE_TIMEZONE ?? 'UTC',
  }).format(new Date())
}
