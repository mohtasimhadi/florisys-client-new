// types/bed.ts
export type SpatialMap = {
  id: string
  fileName: string               // original filename
  filename?: string              // stored filename on server (if provided)
  url?: string                   // absolute URL (if server provides)
  date: string                   // ISO timestamp
}

export type Bed = {
  id: string
  name: string
  coordinates: [number, number][][]
  createdAt?: string
  updatedAt?: string
  spatialMaps?: SpatialMap[]     // ✅ include maps
}
