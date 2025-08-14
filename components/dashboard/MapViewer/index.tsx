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
import { useSettings } from '@/lib/settingsStore'

export default function MapViewer() {
  const { plots, selectedId } = usePlotStore()
  const plot = useMemo(() => plots.find(p => p.id === selectedId) ?? null, [plots, selectedId])

  const [map, setMap] = useState<Map | null>(null)
  const onReady = useCallback((m: Map) => setMap(m), [])

  const { loading, ready, viewCode } = useRaster(map, plot)

  const { dashboardBaseUrl } = useSettings()
  const apiBase = (dashboardBaseUrl || 'http://localhost:8000').replace(/\/$/, '')

  const beds = useBeds(map, plot, { ready, viewCode, apiBase })

  return (
    <div className="relative h-full w-full bg-gray-800">
      <BedToolbar
        adding={beds.mode === 'adding'}
        onToggleAdd={() => (beds.mode === 'adding' ? beds.cancelAdd() : beds.startAdd())}
        editingName={beds.editingName}
        onCancelEdit={beds.cancelEdit}
        disabled={!plot}
      />

      {!plot && (
        <div className="absolute inset-0 z-10 grid place-items-center p-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-8 py-12 shadow-lg border border-sky-200">
            <h2 className="text-lg font-semibold text-slate-700">No plot selected</h2>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              Select a plot from the sidebar to start.
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

      {beds.selected && plot && (
        <BedDetailsPanel
          bed={beds.selected}
          apiBase={apiBase}
          onClose={() => beds.setSelected(null)}
          onStartEdit={() => beds.startEdit(beds.selected!.id)}
          onDelete={(id) => beds.removeBed(id)}
          onUploadSpatialMap={async (bedId, file) => {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch(`${apiBase}/plots/${plot.id}/beds/${bedId}/spatial-maps`, {
              method: 'POST',
              body: fd,
            })
            if (!res.ok) throw new Error('Upload failed')
            await beds.reloadSelected()
          }}
          onCollectRoverData={async (bedId) => {
            const res = await fetch(`${apiBase}/plots/${plot.id}/beds/${bedId}/collect-rover-data`, {
              method: 'POST',
            })
            if (!res.ok) throw new Error('Rover trigger failed')
          }}
        />
      )}

      {beds.pending && (
        <ConfirmShapeModal
          kind={beds.pending.kind}
          ringLL={beds.pending.ringLL}
          onCancel={beds.pending.kind === 'add' ? beds.cancelAdd : beds.cancelEdit}
          onSave={beds.pending.kind === 'add' ? (name?: string) => beds.saveAdd(name!) : () => beds.saveEdit()}
        />
      )}
    </div>
  )
}
