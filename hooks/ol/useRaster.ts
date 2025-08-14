// hooks/ol/useRaster.ts
import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { WebGLTile as TileLayer } from 'ol/layer'
import GeoTIFF from 'ol/source/GeoTIFF'

export function useRaster(
  map: Map | null,
  plot: { id: string; url: string } | null
) {
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [viewCode, setViewCode] = useState<string | null>(null)
  const rasterRef = useRef<TileLayer<GeoTIFF> | null>(null)

  useEffect(() => {
    if (!map) return
    let cancelled = false
    setReady(false)
    setViewCode(null)

    const run = async () => {
      // remove previous raster only
      if (rasterRef.current) {
        map.removeLayer(rasterRef.current)
        rasterRef.current = null
      }
      if (!plot) return

      setLoading(true)

      const url = plot.url.includes('?') ? `${plot.url}&v=${plot.id}` : `${plot.url}?v=${plot.id}`
      const src = new GeoTIFF({ sources: [{ url }], transition: 0 })

      const vi = await src.getView().catch(() => null)
      if (!vi || cancelled) { setLoading(false); return }

      const raster = new TileLayer({ source: src })
      raster.setZIndex(0)
      map.addLayer(raster)
      rasterRef.current = raster

      const view = new View({
        projection: vi.projection,
        resolutions: vi.resolutions,
        extent: vi.extent
      })
      map.setView(view)

      // ensure layout before fit
      await new Promise(r => requestAnimationFrame(r as FrameRequestCallback))
      map.updateSize()
      if (vi.extent) {
        view.fit(vi.extent, { size: map.getSize() ?? undefined, padding: [16,16,16,16] })
      }

      const onReady = () => {
        if (src.getState() === 'ready') {
          if (!cancelled) {
            setViewCode(view.getProjection().getCode())
            setReady(true)
            setLoading(false)
          }
          src.un('change', onReady)
        }
      }
      src.on('change', onReady)
      // in case it's already ready
      onReady()
    }

    run()
    return () => { cancelled = true }
  }, [map, plot?.id, plot?.url])

  return { loading, ready, viewCode }
}
