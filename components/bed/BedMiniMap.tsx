// components/bed/BedMiniMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { Polygon } from 'ol/geom'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { WebGLTile as TileLayer } from 'ol/layer'            // ✅ use WebGL renderer
import GeoTIFF from 'ol/source/GeoTIFF'
import { Feature } from 'ol'
import { Fill, Stroke, Style } from 'ol/style'
import { transform } from 'ol/proj'

function closeRing(ring: [number, number][]) {
  if (!ring?.length) return ring
  const [x0, y0] = ring[0]
  const [xn, yn] = ring[ring.length - 1]
  return x0 === xn && y0 === yn ? ring : [...ring, ring[0]]
}

export default function BedMiniMap({
  ringLL,
  plotUrl,
  className = ''
}: {
  ringLL: [number, number][]
  plotUrl?: string | null
  className?: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const vsrcRef = useRef<VectorSource | null>(null)
  const rasterRef = useRef<TileLayer | null>(null)

  // init map (once)
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return

    const vsrc = new VectorSource()
    const vlay = new VectorLayer({
      source: vsrc,
      zIndex: 10,
      style: new Style({
        fill: new Fill({ color: 'rgba(14,165,233,0.15)' }),
        stroke: new Stroke({ color: '#0ea5e9', width: 2 })
      })
    })

    const map = new Map({
      target: hostRef.current,
      layers: [vlay],                  // raster added below
      view: new View({
        projection: 'EPSG:4326',
        center: [0, 0],
        zoom: 2
      })
    })

    vsrcRef.current = vsrc
    mapRef.current = map

    const ro = new ResizeObserver(() => map.updateSize())
    ro.observe(hostRef.current)

    return () => {
      ro.disconnect()
      map.setTarget(undefined)
      mapRef.current = null
      vsrcRef.current = null
      rasterRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !plotUrl) return

    if (rasterRef.current) {
      map.removeLayer(rasterRef.current)
      rasterRef.current = null
    }

    const src = new GeoTIFF({
      sources: [{ url: plotUrl }],
    } as any)

    const raster = new TileLayer({ source: src, zIndex: 1 })
    map.getLayers().insertAt(0, raster)
    rasterRef.current = raster

    const setupFromView = (vi: any) => {
      if (!vi) return
      const view = new View({
        projection: vi.projection,
        resolutions: vi.resolutions,
        extent: vi.extent
      })
      map.setView(view)
      map.updateSize()
      // fit to bed if available, otherwise to raster extent
      const code = view.getProjection().getCode()
      const ring = closeRing(ringLL || [])
      if (ring.length >= 4) {
        const ringXY = ring.map(([lon, lat]) => transform([lon, lat], 'EPSG:4326', code) as [number, number])
        const poly = new Polygon([ringXY])
        view.fit(poly.getExtent(), { padding: [12, 12, 12, 12], maxZoom: 20, duration: 150 })
      } else if (vi.extent) {
        view.fit(vi.extent, { padding: [12, 12, 12, 12], duration: 150 })
      }
      renderRing()
    }

    const tryInit = () => {
      const gv = (src as any).getView?.()
      if (gv && typeof gv.then === 'function') {
        ;(gv as Promise<any>).then(setupFromView)
      } else {
        setupFromView(gv)
      }
    }

    tryInit()
    const onChange = () => {
      if (src.getState() === 'ready') tryInit()
    }
    src.on('change', onChange)
    return () => src.un('change', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotUrl])

  // render/update polygon
  const renderRing = () => {
    const map = mapRef.current
    const vsrc = vsrcRef.current
    if (!map || !vsrc) return

    vsrc.clear()
    if (!ringLL?.length) return

    const view = map.getView()
    const code = view.getProjection().getCode()
    const ring = closeRing(ringLL)
    const ringXY = ring.map(([lon, lat]) => transform([lon, lat], 'EPSG:4326', code) as [number, number])

    const poly = new Polygon([ringXY])
    const feat = new Feature(poly)
    vsrc.addFeature(feat)
  }

  useEffect(() => {
    renderRing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringLL])

  return (
    <div
      ref={hostRef}
      className={[
        'h-48 w-full rounded-lg border border-sky-200 bg-white/70 shadow-sm',
        className
      ].join(' ')}
    />
  )
}
