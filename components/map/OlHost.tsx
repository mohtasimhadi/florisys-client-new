// components/map/OlHost.tsx
'use client'

import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import 'ol/ol.css'

export default function OlHost({
  onReady,
  className = 'h-full w-full'
}: {
  onReady: (map: Map) => void
  className?: string
}) {
  const divRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = new Map({
      target: divRef.current,
      view: new View({ center: [0, 0], zoom: 2 }),
      layers: []
    })
    mapRef.current = map
    onReady(map)

    const ro = new ResizeObserver(() => map.updateSize())
    ro.observe(divRef.current)

    return () => {
      ro.disconnect()
      map.setTarget(undefined)
      mapRef.current = null
    }
  }, [onReady])

  return <div ref={divRef} className={className} />
}
