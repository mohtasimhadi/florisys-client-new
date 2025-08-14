// hooks/ol/useBeds.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Fill, Stroke, Style } from 'ol/style'
import { Feature } from 'ol'
import { Polygon } from 'ol/geom'
import Overlay from 'ol/Overlay'
import Draw from 'ol/interaction/Draw'
import { transform } from 'ol/proj'
import { listBeds, createBed, updateBed, deleteBed } from '@/lib/bedsApi'
import type { Bed } from '@/types/bed'

type Mode = 'idle' | 'adding' | 'editing'
type Pending =
  | { kind: 'add'; ringLL: [number, number][] }
  | { kind: 'edit'; ringLL: [number, number][], bedId: string, bedName: string }

type UseBedsOpts = {
  ready: boolean
  viewCode: string | null
  apiBase: string // passed in from component
}

export function useBeds(
  map: Map | null,
  plot: { id: string } | null,
  opts: UseBedsOpts
) {
  const { ready, viewCode, apiBase } = opts
  const base = (apiBase || 'http://localhost:8000').replace(/\/$/, '')

  const bedsSrcRef = useRef<VectorSource | null>(null)
  const bedsLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const scratchSrcRef = useRef<VectorSource | null>(null)
  const scratchLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const overlaysRef = useRef<Overlay[]>([])
  const drawRef = useRef<Draw | null>(null)

  const [selected, setSelected] = useState<Bed | null>(null)
  const [mode, setMode] = useState<Mode>('idle')
  const [pending, setPending] = useState<Pending | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)

  const closeRing = (xy: number[][]) => {
    if (!xy.length) return xy
    const [x0, y0] = xy[0]; const [xn, yn] = xy[xy.length - 1]
    return (x0 === xn && y0 === yn) ? xy : [...xy, xy[0]]
  }

  const featureToBed = (f: Feature, currentViewCode: string): Bed => {
    const name = (f.get('name') as string) ?? String(f.getId() ?? 'Bed')
    const coordsXY = (f.getGeometry() as Polygon).getCoordinates()[0]
    const closed = closeRing(coordsXY)
    const coordsLL = closed.map(([x, y]) => transform([x, y], currentViewCode, 'EPSG:4326') as [number, number])
    return { id: String(f.getId() ?? ''), name, coordinates: [coordsLL] }
  }

  const ensureScratchLayer = useCallback(() => {
    if (!map) return
    if (!scratchLayerRef.current) {
      const src = new VectorSource()
      const layer = new VectorLayer({
        source: src,
        zIndex: 20,
        style: new Style({
          fill: new Fill({ color: 'rgba(250,204,21,.10)' }),
          stroke: new Stroke({ color: '#facc15', width: 2, lineDash: [6, 4] })
        })
      })
      scratchSrcRef.current = src
      scratchLayerRef.current = layer
      map.addLayer(layer)
    }
  }, [map])

  const clearOverlays = useCallback(() => {
    if (!map) return
    overlaysRef.current.forEach(o => map.removeOverlay(o))
    overlaysRef.current = []
  }, [map])

  // helper: load full bed with spatialMaps
  const fetchBedDetail = useCallback(async (bedId: string) => {
    if (!plot) return null
    const r = await fetch(`${base}/plots/${plot.id}/beds/${bedId}`)
    if (!r.ok) return null
    return (await r.json()) as Bed
  }, [base, plot])

  const buildOverlays = useCallback(() => {
    if (!map || !bedsSrcRef.current || !viewCode) return
    clearOverlays()
    bedsSrcRef.current.getFeatures().forEach((f) => {
      const geom = f.getGeometry()
      if (!(geom instanceof Polygon)) return
      const pos = geom.getInteriorPoint().getCoordinates()
      const name = (f.get('name') as string) ?? String(f.getId() ?? 'Bed')

      const el = document.createElement('button')
      el.textContent = name
      Object.assign(el.style, {
        padding: '4px 10px',
        fontSize: '12px',
        borderRadius: '9999px',
        border: '1px solid rgba(63,63,70,.2)',
        color: 'rgb(51,65,85)',
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(0,0,0,.08)'
      } as CSSStyleDeclaration)
      el.onclick = async (e) => {
        e.stopPropagation()
        const id = String(f.getId())
        // fetch full bed to include spatialMaps
        const full = await fetchBedDetail(id)
        if (full) {
          setSelected(full)
        } else if (viewCode) {
          setSelected(featureToBed(f, viewCode))
        }
        setMode('idle')
      }
      const ov = new Overlay({ element: el, position: pos, positioning: 'center-center', stopEvent: true })
      map.addOverlay(ov)
      overlaysRef.current.push(ov)
    })
  }, [map, clearOverlays, viewCode, fetchBedDetail])

  // Build beds layer + fetch data when ready
  useEffect(() => {
    if (!map) return
    if (bedsLayerRef.current) {
      map.removeLayer(bedsLayerRef.current)
      bedsLayerRef.current = null
      bedsSrcRef.current = null
    }
    if (drawRef.current) {
      map.removeInteraction(drawRef.current)
      drawRef.current = null
    }
    clearOverlays()
    scratchSrcRef.current?.clear()
    setSelected(null)
    setMode('idle')
    setPending(null)
    setEditingName(null)

    if (!plot || !ready || !viewCode) return

    const src = new VectorSource()
    const layer = new VectorLayer({
      source: src,
      zIndex: 10,
      style: new Style({
        fill: new Fill({ color: 'rgba(99,102,241,.15)' }),
        stroke: new Stroke({ color: '#818cf8', width: 2 })
      })
    })
    bedsSrcRef.current = src
    bedsLayerRef.current = layer
    map.addLayer(layer)

    ;(async () => {
      const beds = await listBeds(plot.id)
      beds.forEach(b => {
        const ring = b.coordinates[0]?.map(([lon, lat]) => transform([lon, lat], 'EPSG:4326', viewCode))
        if (!ring || ring.length < 4) return
        const poly = new Polygon([ring as [number, number][]])
        const f = new Feature(poly)
        f.setId(b.id)
        f.set('name', b.name)
        src.addFeature(f)
      })
      buildOverlays()
    })()

    const onChange = () => buildOverlays()
    src.on('addfeature', onChange)
    src.on('removefeature', onChange)
    src.on('changefeature', onChange)
    return () => {
      src.un('addfeature', onChange)
      src.un('removefeature', onChange)
      src.un('changefeature', onChange)
      clearOverlays()
    }
  }, [map, plot?.id, ready, viewCode, clearOverlays, buildOverlays])

  useEffect(() => {
    if (!map || !bedsLayerRef.current || !viewCode) return
    const handler = async (evt: any) => {
      if (mode !== 'idle') return
      let opened = false
      map.forEachFeatureAtPixel(evt.pixel, async (f, l) => {
        if (l !== bedsLayerRef.current) return undefined
        const id = String((f as Feature).getId())
        const full = await fetchBedDetail(id)
        if (full) setSelected(full)
        else setSelected(featureToBed(f as Feature, viewCode))
        opened = true
        return true
      })
      return opened
    }
    map.on('click', handler)
    return () => { map.un('click', handler) }
  }, [map, mode, viewCode, fetchBedDetail])

  const clearDraw = () => {
    if (drawRef.current && map) {
      map.removeInteraction(drawRef.current)
      drawRef.current = null
    }
  }

  const startAdd = () => {
    if (!map || !viewCode) return
    if (!scratchLayerRef.current) {
      const src = new VectorSource()
      const layer = new VectorLayer({
        source: src,
        zIndex: 20,
        style: new Style({
          fill: new Fill({ color: 'rgba(250,204,21,.10)' }),
          stroke: new Stroke({ color: '#facc15', width: 2, lineDash: [6, 4] })
        })
      })
      scratchSrcRef.current = src
      scratchLayerRef.current = layer
      map.addLayer(layer)
    }
    setSelected(null)
    setMode('adding')
    clearDraw()
    scratchSrcRef.current?.clear()
    const draw = new Draw({ source: scratchSrcRef.current!, type: 'Polygon', maxPoints: 4 })
    draw.on('drawend', (e) => {
      const coords = (e.feature.getGeometry() as Polygon).getCoordinates()[0]
      const ringLL = closeRing(coords).slice(0, 5).map(
        ([x, y]) => transform([x, y], viewCode, 'EPSG:4326') as [number, number]
      )
      setPending({ kind: 'add', ringLL })
    })
    map.addInteraction(draw)
    drawRef.current = draw
  }

  const cancelAdd = () => {
    scratchSrcRef.current?.clear()
    setPending(null)
    setMode('idle')
    clearDraw()
  }

  const saveAdd = async (name: string) => {
    if (!plot || !map || !bedsSrcRef.current || !pending || pending.kind !== 'add' || !viewCode) return
    const created = await createBed(plot.id, { name, coordinates: [pending.ringLL] })
    const ringXY = created.coordinates[0].map(
      ([lon, lat]) => transform([lon, lat], 'EPSG:4326', viewCode) as [number, number]
    )
    const f = new Feature(new Polygon([ringXY]))
    f.setId(created.id)
    f.set('name', created.name)
    bedsSrcRef.current.addFeature(f)
    scratchSrcRef.current?.clear()
    buildOverlays()
    setSelected(created)
    setPending(null)
    setMode('idle')
    clearDraw()
  }

  const startEdit = (bedId: string) => {
    if (!map || !viewCode) return
    const name = (selected && selected.id === bedId) ? selected.name : 'Bed'
    setSelected(null)
    setMode('editing')
    setEditingName(name)
    clearDraw()
    scratchSrcRef.current?.clear()

    const draw = new Draw({ source: scratchSrcRef.current!, type: 'Polygon', maxPoints: 4 })
    draw.on('drawend', (e) => {
      const coords = (e.feature.getGeometry() as Polygon).getCoordinates()[0]
      const ringLL = closeRing(coords).slice(0, 5).map(
        ([x, y]) => transform([x, y], viewCode, 'EPSG:4326') as [number, number]
      )
      setPending({ kind: 'edit', ringLL, bedId, bedName: name })
    })
    map.addInteraction(draw)
    drawRef.current = draw
  }

  const cancelEdit = () => {
    scratchSrcRef.current?.clear()
    setPending(null)
    setEditingName(null)
    setMode('idle')
    clearDraw()
  }

  const saveEdit = async () => {
    if (!plot || !pending || pending.kind !== 'edit' || !bedsSrcRef.current || !viewCode) return
    const updated = await updateBed(plot.id, pending.bedId, { coordinates: [pending.ringLL] })
    const ringXY = pending.ringLL.map(
      ([lon, lat]) => transform([lon, lat], 'EPSG:4326', viewCode) as [number, number]
    )
    const target = bedsSrcRef.current.getFeatureById(pending.bedId) as Feature<Polygon> | null
    if (target) target.setGeometry(new Polygon([ringXY]))
    scratchSrcRef.current?.clear()
    buildOverlays()
    setSelected(updated)
    setPending(null)
    setEditingName(null)
    setMode('idle')
    clearDraw()
  }

  const removeBed = async (bedId: string) => {
    if (!plot || !bedsSrcRef.current) return
    await deleteBed(plot.id, bedId)
    const f = bedsSrcRef.current.getFeatureById(bedId)
    if (f) bedsSrcRef.current.removeFeature(f)
    setSelected(null)
    buildOverlays()
  }

  const reloadSelected = async () => {
    if (!selected || !plot) return
    const res = await fetch(`${base}/plots/${plot.id}/beds/${selected.id}`)
    if (!res.ok) return
    const updated = await res.json()
    setSelected(updated)
  }

  return {
    selected,
    mode,
    pending,
    editingName,
    setSelected,
    startAdd,
    cancelAdd,
    saveAdd,
    startEdit,
    cancelEdit,
    saveEdit,
    removeBed,
    reloadSelected,
  }
}
