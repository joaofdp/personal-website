// v2
'use server'

import { revalidatePath } from 'next/cache'
import { readContent, writeContent, todayString } from '@/lib/content'

function checkPassword(formData: FormData): void {
  const submitted = formData.get('password') as string
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || submitted !== expected) {
    throw new Error('Unauthorized')
  }
}

export async function verifyPassword(
  formData: FormData
): Promise<{ ok: boolean }> {
  const submitted = formData.get('password') as string
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || submitted !== expected) {
    return { ok: false }
  }
  return { ok: true }
}

export async function updateCurrently(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    checkPassword(formData)
  } catch {
    return { ok: false, error: 'Unauthorized' }
  }

  const newText = (formData.get('text') as string)?.trim()
  if (!newText) return { ok: false, error: 'Text is required' }

  try {
    const content = await readContent()

    // Archive the current entry if it has text
    if (content.currently.text.trim()) {
      content.archive.push({
        date: content.currently.updatedAt,
        text: content.currently.text,
      })
    }

    content.currently.text = newText
    content.currently.updatedAt = todayString()

    await writeContent(content)

    revalidatePath('/')
    revalidatePath('/archive')

    return { ok: true }
  } catch (e) {
    return { ok: false, error: 'Failed to save' }
  }
}

export async function saveAnnotation(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    checkPassword(formData)
  } catch {
    return { ok: false, error: 'Unauthorized' }
  }

  const type = formData.get('type') as 'listening' | 'watching'
  const key = formData.get('key') as string
  const annotation = (formData.get('annotation') as string)?.trim()

  if (!type || !key) return { ok: false, error: 'Missing fields' }

  try {
    const content = await readContent()

    if (annotation) {
      content.annotations[type][key] = annotation
    } else {
      delete content.annotations[type][key]
    }

    await writeContent(content)
    revalidatePath('/')

    return { ok: true }
  } catch {
    return { ok: false, error: 'Failed to save' }
  }
}
