// types/bed.ts
export type SpatialMap = {
  id: string
  fileName: string
  filePath?: string
  date: string
}

export type Bed = {
  id: string
  name: string
  coordinates: [number, number][][] // GeoJSON Polygon ring(s) in EPSG:4326
  createdAt?: string
  updatedAt?: string
  spatialMaps?: SpatialMap[] // ✅ Added
}
