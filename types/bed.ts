// types/bed.ts
export type Bed = {
  id: string
  name: string
  coordinates: [number, number][][] // GeoJSON Polygon ring(s) in EPSG:4326
  createdAt?: string
  updatedAt?: string
}
