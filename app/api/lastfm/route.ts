import { NextResponse } from 'next/server'
import { getTopAlbums } from '@/lib/lastfm'

export async function GET() {
  const albums = await getTopAlbums()
  return NextResponse.json(albums)
}
