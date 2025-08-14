// hooks/ol/useBeds.ts
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
  | { kind: 'add'; ringLL: [number,number][] }
  | { kind: 'edit'; ringLL: [number,number][], bedId: string, bedName: string }

export function useBeds(
  map: Map | null,
  plot: { id: string } | null,
  opts: { ready: boolean; viewCode: string | null }
) {
  const { ready, viewCode } = opts

  // main beds layer
  const bedsSrcRef = useRef<VectorSource | null>(null)
  const bedsLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  // scratch layer for temporary drawings
  const scratchSrcRef = useRef<VectorSource | null>(null)
  const scratchLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  // overlays
  const overlaysRef = useRef<Overlay[]>([])

  // UI state
  const [selected, setSelected] = useState<Bed | null>(null)
  const [mode, setMode] = useState<Mode>('idle')
  const [pending, setPending] = useState<Pending | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)

  const closeRing = (xy: number[][]) => {
    if (!xy.length) return xy
    const [x0,y0] = xy[0]; const [xn,yn] = xy[xy.length-1]
    return (x0===xn && y0===yn) ? xy : [...xy, xy[0]]
  }
  const featureToBed = (f: Feature, currentViewCode: string): Bed => {
    const name = (f.get('name') as string) ?? String(f.getId() ?? 'Bed')
    const coordsXY = (f.getGeometry() as Polygon).getCoordinates()[0]
    const closed = closeRing(coordsXY)
    const coordsLL = closed.map(([x,y]) => transform([x,y], currentViewCode, 'EPSG:4326') as [number,number])
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
          stroke: new Stroke({ color: '#facc15', width: 2, lineDash: [6,4] })
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
        border: '1px solid rgba(63,63,70,.8)',
        color: 'rgb(228,228,231)',
        background: 'rgba(24,24,27,.85)',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      } as CSSStyleDeclaration)
      el.onclick = (e) => {
        e.stopPropagation()
        if (!viewCode) return
        const bed = featureToBed(f, viewCode)
        setSelected(bed)
        setMode('idle')
      }
      const ov = new Overlay({ element: el, position: pos, positioning: 'center-center', stopEvent: true })
      map.addOverlay(ov)
      overlaysRef.current.push(ov)
    })
  }, [map, clearOverlays, viewCode])

  // Build beds layer + fetch data ONLY when raster/view is ready
  useEffect(() => {
    if (!map) return
    // reset when plot changes or when view changes
    if (bedsLayerRef.current) {
      map.removeLayer(bedsLayerRef.current)
      bedsLayerRef.current = null
      bedsSrcRef.current = null
    }
    clearOverlays()
    scratchSrcRef.current?.clear()
    setSelected(null)
    setMode('idle')
    setPending(null)
    setEditingName(null)

    // wait for raster to be ready & projection available
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
        const ring = b.coordinates[0]?.map(([lon,lat]) => transform([lon,lat], 'EPSG:4326', viewCode))
        if (!ring || ring.length < 4) return
        const poly = new Polygon([ring as [number,number][]])
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

  // Whole polygon click -> open panel (idle only)
  useEffect(() => {
    if (!map || !bedsLayerRef.current || !viewCode) return
    const handler = (evt: any) => {
      if (mode !== 'idle') return
      let opened = false
      map.forEachFeatureAtPixel(evt.pixel, (f, l) => {
        if (l !== bedsLayerRef.current) return undefined
        const bed = featureToBed(f as Feature, viewCode)
        setSelected(bed)
        opened = true
        return true
      })
      return opened
    }
    map.on('click', handler)
    return () => { map.un('click', handler) }
  }, [map, mode, viewCode])

  // Public API

  const startAdd = () => {
    if (!map || !viewCode) return
    ensureScratchLayer()
    setSelected(null)
    setMode('adding')
    // remove old draws
    map.getInteractions().forEach(i => { if (i instanceof Draw) map.removeInteraction(i) })
    const draw = new Draw({ source: scratchSrcRef.current!, type: 'Polygon', maxPoints: 4 })
    draw.on('drawend', (e) => {
      const coords = (e.feature.getGeometry() as Polygon).getCoordinates()[0]
      const ringLL = closeRing(coords).slice(0,5).map(([x,y]) => transform([x,y], viewCode, 'EPSG:4326') as [number,number])
      setPending({ kind: 'add', ringLL })
    })
    map.addInteraction(draw)
  }

  const cancelAdd = () => {
    if (!map) return
    scratchSrcRef.current?.clear()
    setPending(null)
    setMode('idle')
    map.getInteractions().forEach(i => { if (i instanceof Draw) map.removeInteraction(i) })
  }

  const saveAdd = async (name: string) => {
    if (!plot || !map || !bedsSrcRef.current || !pending || pending.kind !== 'add' || !viewCode) return
    const created = await createBed(plot.id, { name, coordinates: [pending.ringLL] })
    // add to main layer
    const ringXY = created.coordinates[0].map(([lon,lat]) => transform([lon,lat], 'EPSG:4326', viewCode) as [number,number])
    const f = new Feature(new Polygon([ringXY]))
    f.setId(created.id)
    f.set('name', created.name)
    bedsSrcRef.current.addFeature(f)
    scratchSrcRef.current?.clear()
    buildOverlays()
    setSelected(created)
    setPending(null)
    setMode('idle')
    map.getInteractions().forEach(i => { if (i instanceof Draw) map.removeInteraction(i) })
  }

  const startEdit = (bed: Bed) => {
    if (!map || !viewCode) return
    ensureScratchLayer()
    setSelected(null) // close panel so clicks reach the map
    setMode('editing')
    setEditingName(bed.name)
    // remove old draws
    map.getInteractions().forEach(i => { if (i instanceof Draw) map.removeInteraction(i) })

    const draw = new Draw({ source: scratchSrcRef.current!, type: 'Polygon', maxPoints: 4 })
    draw.on('drawend', (e) => {
      const coords = (e.feature.getGeometry() as Polygon).getCoordinates()[0]
      const ringLL = closeRing(coords).slice(0,5).map(([x,y]) => transform([x,y], viewCode, 'EPSG:4326') as [number,number])
      setPending({ kind: 'edit', ringLL, bedId: bed.id, bedName: bed.name })
    })
    map.addInteraction(draw)
  }

  const cancelEdit = () => {
    if (!map) return
    scratchSrcRef.current?.clear()
    setPending(null)
    setEditingName(null)
    setMode('idle')
    map.getInteractions().forEach(i => { if (i instanceof Draw) map.removeInteraction(i) })
  }

  const saveEdit = async () => {
    if (!plot || !map || !pending || pending.kind !== 'edit' || !bedsSrcRef.current || !viewCode) return
    const updated = await updateBed(plot.id, pending.bedId, { coordinates: [pending.ringLL] })
    // update geometry of existing feature
    const ringXY = pending.ringLL.map(([lon,lat]) => transform([lon,lat], 'EPSG:4326', viewCode) as [number,number])
    const target = bedsSrcRef.current.getFeatureById(pending.bedId) as Feature<Polygon> | null
    if (target) target.setGeometry(new Polygon([ringXY]))
    scratchSrcRef.current?.clear()
    buildOverlays()
    setSelected(updated)
    setPending(null)
    setEditingName(null)
    setMode('idle')
    map.getInteractions().forEach(i => { if (i instanceof Draw) map.removeInteraction(i) })
  }

  const removeBed = async (bedId: string) => {
    if (!plot || !bedsSrcRef.current) return
    await deleteBed(plot.id, bedId)
    const f = bedsSrcRef.current.getFeatureById(bedId)
    if (f) bedsSrcRef.current.removeFeature(f)
    setSelected(null)
    buildOverlays()
  }

  return {
    // state
    selected,
    mode,
    pending,         // null | { kind:'add'|'edit', ringLL, ... }
    editingName,
    // actions
    setSelected,
    startAdd,
    cancelAdd,
    saveAdd,
    startEdit,
    cancelEdit,
    saveEdit,
    removeBed,
  }
}
