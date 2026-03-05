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

export interface SnapshotAlbum {
  name: string
  artist: string
  playcount: string
  url: string
  imageUrl: string
  annotation?: string
}

export interface SnapshotFilm {
  title: string
  link: string
  posterUrl: string
  rating?: string
  annotation?: string
}

export interface Snapshot {
  date: string // YYYY-MM-DD
  currently: string
  listening: SnapshotAlbum[]
  watching: SnapshotFilm[]
}

export interface ContentSchema {
  currently: Currently
  archive: ArchiveEntry[]
  snapshots: Snapshot[]
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
