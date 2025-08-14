// components/dashboard/MapViewer/index.tsx
'use client'

import { useCallback, useMemo, useState } from 'react'
import Map from 'ol/Map'
import OlHost from '@/components/map/OlHost'
import { useRaster } from '@/hooks/ol/useRaster'
import { useBeds } from '@/hooks/ol/useBeds'
import { usePlotStore } from '@/lib/plotStore'
import Spinner from '@/components/ui/Spinner'
import BedToolbar from '@/components/dashboard/BedToolbar'
import BedDetailsPanel from '@/components/dashboard/BedDetailsPanel'
import ConfirmShapeModal from '@/components/dashboard/ConfirmShapeModal'

export default function MapViewer() {
  const { plots, selectedId } = usePlotStore()
  const plot = useMemo(() => plots.find(p => p.id === selectedId) ?? null, [plots, selectedId])

  const [map, setMap] = useState<Map | null>(null)
  const onReady = useCallback((m: Map) => setMap(m), [])

  const { loading, ready, viewCode } = useRaster(map, plot)
  const beds = useBeds(map, plot, { ready, viewCode })

  return (
    <div className="relative h-full w-full">
      <BedToolbar
        adding={beds.mode === 'adding'}
        onToggleAdd={() => beds.mode === 'adding' ? beds.cancelAdd() : beds.startAdd()}
        editingName={beds.editingName}
        onCancelEdit={beds.cancelEdit}
        disabled={!plot}
      />

      {!plot && (
        <div className="absolute inset-0 z-10 grid place-items-center p-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/40 px-6 py-10 text-center">
            <div className="text-sm text-zinc-400">Click a plot to load</div>
          </div>
        </div>
      )}
      <OlHost onReady={onReady} />

      {loading && plot && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-zinc-950/60 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full bg-zinc-900/60 px-4 py-2 text-sm text-zinc-100 shadow-lg ring-1 ring-zinc-800/70">
            <Spinner className="h-5 w-5" />
            <span>Loading map…</span>
          </div>
        </div>
      )}

      {beds.selected && (
        <BedDetailsPanel
          bed={beds.selected}
          onClose={() => beds.setSelected(null)}
          onStartEdit={() => beds.startEdit(beds.selected!)}
          onDelete={(id) => beds.removeBed(id)}
        />
      )}

      {beds.pending && (
        <ConfirmShapeModal
          kind={beds.pending.kind}
          ringLL={beds.pending.ringLL}
          onCancel={beds.pending.kind === 'add' ? beds.cancelAdd : beds.cancelEdit}
          onSave={beds.pending.kind === 'add'
            ? (name?: string) => beds.saveAdd(name!)
            : () => beds.saveEdit()}
        />
      )}
    </div>
  )
}
