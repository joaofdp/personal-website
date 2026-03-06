import { NextResponse } from 'next/server'
import { getRecentFilms } from '@/lib/letterboxd'

export const revalidate = 300

export async function GET() {
  const films = await getRecentFilms()
  return NextResponse.json(films)
}
