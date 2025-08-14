'use client'
import { MdOutlineMap } from 'react-icons/md'
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
    <div className="relative h-full w-full bg-gray-800">
      <BedToolbar
        adding={beds.mode === 'adding'}
        onToggleAdd={() => beds.mode === 'adding' ? beds.cancelAdd() : beds.startAdd()}
        editingName={beds.editingName}
        onCancelEdit={beds.cancelEdit}
        disabled={!plot}
      />

      {!plot && (
        <div className="absolute inset-0 z-10 grid place-items-center p-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-8 py-12 shadow-lg border border-sky-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 shadow-inner">
              <MdOutlineMap className="w-8 h-8 text-sky-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">No plot selected</h2>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              Select a plot from the sidebar to start exploring. Your selected plot will be displayed here with its beds and details.
            </p>
          </div>
        </div>
      )}


      <OlHost onReady={onReady} />

      {loading && plot && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-gradient-to-r from-sky-100/80 via-cyan-100/80 to-teal-100/80 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-800 shadow-lg ring-1 ring-sky-200">
            <Spinner className="h-5 w-5 text-sky-500" />
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
