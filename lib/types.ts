export interface Currently {
  text: string
  updatedAt: string // YYYY-MM-DD
}

export interface ArchiveEntry {
  date: string // YYYY-MM-DD
  text: string
}

export interface Annotations {
  listening: Record<string, string> // "artist::album" -> annotation
  watching: Record<string, string>  // letterboxd guid -> annotation
}

export interface ContentSchema {
  currently: Currently
  archive: ArchiveEntry[]
  annotations: Annotations
}

export interface LastFmAlbum {
  name: string
  artist: string
  playcount: string
  url: string
  imageUrl: string // extracted large image
}

export interface LetterboxdFilm {
  title: string
  link: string
  guid: string
  pubDate: string
  posterUrl: string // extracted from description HTML
  rating: string   // extracted from description, e.g. "★★★½"
}
