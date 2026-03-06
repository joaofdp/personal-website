// In-memory token cache — persists across requests within the same warm instance
let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // 60s buffer
    return cachedToken
  } catch {
    return null
  }
}

export async function getSpotifyAlbumUrl(
  artist: string,
  album: string
): Promise<string | null> {
  const token = await getAccessToken()
  if (!token) return null

  const q = encodeURIComponent(`album:${album} artist:${artist}`)
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=album&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.albums?.items?.[0]?.external_urls?.spotify ?? null
  } catch {
    return null
  }
}
