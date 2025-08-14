'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePlotStore } from '@/lib/plotStore'
import Map from 'ol/Map'
import View from 'ol/View'
import GeoTIFF from 'ol/source/GeoTIFF'
import { WebGLTile as TileLayer } from 'ol/layer'
import Spinner from '@/components/ui/Spinner'
import 'ol/ol.css'

function EmptyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function MapViewer() {
  const { plots, selectedId } = usePlotStore()
  const plot = useMemo(() => plots.find(p => p.id === selectedId) ?? null, [plots, selectedId])

  const hostRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const [loading, setLoading] = useState(false)

  // init map once
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return
    const map = new Map({
      target: hostRef.current,
      view: new View({ center: [0, 0], zoom: 2 }),
      layers: []
    })
    mapRef.current = map
    const ro = new ResizeObserver(() => map.updateSize())
    ro.observe(hostRef.current)
    return () => { ro.disconnect(); map.setTarget(undefined) }
  }, [])

  // load on selection
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let cancelled = false

    const run = async () => {
      if (!plot) {
        map.getLayers().clear()
        setLoading(false)
        return
      }

      setLoading(true)

      // optional cache-bust so you can see a request per click (not required)
      const url = plot.url.includes('?') ? `${plot.url}&v=${plot.id}` : `${plot.url}?v=${plot.id}`

      const src = new GeoTIFF({
        sources: [{ url }], // keep minimal & typed
        transition: 0
      })

      // getView() is async – this was the main issue earlier
      const vi = await src.getView().catch(() => null)
      if (cancelled || !vi) { setLoading(false); return }

      const layer = new TileLayer({ source: src })
      map.getLayers().clear()
      map.addLayer(layer)

      const view = new View({
        projection: vi.projection,
        resolutions: vi.resolutions,
        extent: vi.extent
      })
      map.setView(view)

      // ensure container has a size before fit
      await new Promise(r => requestAnimationFrame(r))
      map.updateSize()
      if (vi.extent) {
        view.fit(vi.extent, {
          size: map.getSize() ?? undefined,
          padding: [16, 16, 16, 16]
        })
      }

      // hide loader when source becomes ready (covers cached cases too)
      const onChange = () => {
        if (src.getState() === 'ready') {
          setLoading(false)
          src.un('change', onChange)
        }
      }
      src.on('change', onChange)

      // tiny files may be ready instantly; ensure the overlay disappears
      setTimeout(() => setLoading(false), 300)
    }

    run()
    return () => { cancelled = true }
  }, [plot])

  return (
    <div className="relative h-full w-full">
      {!plot && (
        <div className="absolute inset-0 z-10 grid place-items-center p-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/40 px-6 py-10 text-center">
            <EmptyIcon className="h-8 w-8 text-zinc-600" />
            <div className="text-sm text-zinc-400">Click a plot to load</div>
          </div>
        </div>
      )}
      <div ref={hostRef} className="h-full w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/30" />
      {loading && plot && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-2xl bg-zinc-950/60 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full bg-zinc-900/60 px-4 py-2 text-sm text-zinc-100 shadow-lg ring-1 ring-zinc-800/70">
            <Spinner className="h-5 w-5" />
            <span>Loading map…</span>
          </div>
        </div>
      )}
    </div>
  )
}
